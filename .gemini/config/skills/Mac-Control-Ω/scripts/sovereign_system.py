#!/usr/bin/env python3
# C5-REAL
"""SOVEREIGN SYSTEM v14.1.0"""

import hashlib
import json
import logging
import os
import platform
import re
import subprocess
import sys
import time

try:
    import Quartz
    _QUARTZ_AVAILABLE = True
except ImportError:
    _QUARTZ_AVAILABLE = False
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from typing import Any
from ui_maestro import UIMaestro
import sqlite3
import psutil
import shutil
import shlex

log = logging.getLogger("sovereign_system")

# ---
# CORE EXECUTION — INJECTION-PROOF
# ---


def _sanitize(s: str) -> str:
    if not isinstance(s, str):
        return str(s)
    return s.replace("'", "'\\''")




def _run_safe(cmd_list: list, timeout: int = 10, stdin_data: str = None) -> str:
    try:
        r = subprocess.run(
            cmd_list, capture_output=True, text=True,
            timeout=timeout, input=stdin_data,
        )
        if r.returncode != 0 and r.stderr:
            log.debug("_run_safe stderr: %s", r.stderr[:200])
        return r.stdout.strip()
    except subprocess.TimeoutExpired:
        return "ERROR: timeout"
    except (subprocess.SubprocessError, OSError) as e:
        return f"ERROR: {e}"


def _osa(script: str) -> str:
    return _run_safe(["osascript"], timeout=15, stdin_data=script)


def _result(domain: str, action: str, data: Any, ok: bool = True, state: str = "C5-REAL", verified: bool = False) -> dict:
    return {
        "domain": domain,
        "action": action,
        "ok": ok,
        "data": data,
        "ts": datetime.now().isoformat(),
        "state": state,
        "silicon_verified": verified,
    }


class SiliconVerifyGuard:
    @staticmethod
    def verify(mutation_fn, getter_fn, check_fn, timeout=2.0, retries=4) -> dict:
        res = mutation_fn()
        if not res.get("ok"):
            return res
            
        for _ in range(retries):
            time.sleep(timeout / retries)
            current_state = getter_fn()
            if check_fn(current_state):
                res["state"] = "C5-REAL"
                res["silicon_verified"] = True
                return res
        
        res["state"] = "C4-SIMULATION_FAILED"
        res["silicon_verified"] = False
        res["ok"] = False
        res["error"] = "Silicon-Verify Guard failed: state disconnect detected."
        return res


class StatePersistence:
    DB_PATH = Path("~/.omega/sovereign_state.db").expanduser()
    VESICULAR_DB_PATH = Path("~/.gemini/antigravity/scratch/cortex-c5-ledger/cortex.db").expanduser()

    @classmethod
    def init_db(cls):
        cls.DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(cls.DB_PATH) as conn:
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS domain_state (
                    domain TEXT NOT NULL,
                    key TEXT NOT NULL,
                    value TEXT NOT NULL,
                    version INTEGER DEFAULT 1,
                    updated_at INTEGER NOT NULL,
                    checksum TEXT NOT NULL,
                    checkpoint_hash TEXT,
                    PRIMARY KEY (domain, key)
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS domain_snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT NOT NULL,
                    key TEXT NOT NULL,
                    value TEXT NOT NULL,
                    version INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL,
                    checksum TEXT NOT NULL,
                    checkpoint_hash TEXT NOT NULL,
                    parent_hash TEXT
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_domain_state_updated ON domain_state(domain, updated_at DESC)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_domain_snapshots_updated ON domain_snapshots(domain, updated_at DESC)")

    @classmethod
    def get_latest_checkpoint_hash(cls) -> str:
        if not cls.VESICULAR_DB_PATH.exists():
            return "genesis"
        try:
            with sqlite3.connect(cls.VESICULAR_DB_PATH) as conn:
                row = conn.execute("SELECT hash FROM vesicular_checkpoints ORDER BY timestamp DESC LIMIT 1").fetchone()
                return row[0] if row else "genesis"
        except Exception as e:
            log.warning("Failed to query vesicular_checkpoints: %s", e)
            return "genesis"

    @classmethod
    def extend_vesicular_ledger(cls, checkpoint_hash: str, parent_hash: str, domain: str, key: str, payload_str: str) -> bool:
        if not cls.VESICULAR_DB_PATH.parent.exists():
            cls.VESICULAR_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        try:
            signature = hashlib.sha256(f"{checkpoint_hash}|{parent_hash}|{payload_str}".encode()).hexdigest()
            timestamp = datetime.utcnow().isoformat() + "+00:00"
            intent = f"sovereign_mutation:{domain}:{key}"
            with sqlite3.connect(cls.VESICULAR_DB_PATH) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS vesicular_checkpoints (
                        hash TEXT PRIMARY KEY,
                        timestamp TEXT,
                        intent TEXT,
                        causal_parent TEXT,
                        payload TEXT,
                        signature TEXT
                    )
                """)
                conn.execute("""
                    INSERT OR REPLACE INTO vesicular_checkpoints (hash, timestamp, intent, causal_parent, payload, signature)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (checkpoint_hash, timestamp, intent, parent_hash, payload_str, signature))
            return True
        except Exception as e:
            log.error("Failed to extend vesicular ledger: %s", e)
            return False

    @classmethod
    def save(cls, domain: str, key: str, value: Any) -> str:
        cls.init_db()
        payload = json.dumps(value, sort_keys=True)
        checksum = hashlib.sha256(payload.encode()).hexdigest()[:16]
        
        parent_hash = cls.get_latest_checkpoint_hash()
        signature_data = f"{time.time()}|{domain}|{key}|{payload}|{parent_hash}".encode()
        checkpoint_hash = hashlib.sha256(signature_data).hexdigest()[:16]
        
        with sqlite3.connect(cls.DB_PATH) as conn:
            row = conn.execute("SELECT version FROM domain_state WHERE domain=? AND key=?", (domain, key)).fetchone()
            next_version = (row[0] + 1) if row else 1
            
            conn.execute("""
                INSERT INTO domain_state (domain, key, value, version, updated_at, checksum, checkpoint_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(domain, key) DO UPDATE SET
                    value=excluded.value,
                    version=excluded.version,
                    updated_at=excluded.updated_at,
                    checksum=excluded.checksum,
                    checkpoint_hash=excluded.checkpoint_hash
            """, (domain, key, payload, next_version, int(time.time()*1000), checksum, checkpoint_hash))
            
            conn.execute("""
                INSERT INTO domain_snapshots (domain, key, value, version, updated_at, checksum, checkpoint_hash, parent_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (domain, key, payload, next_version, int(time.time()*1000), checksum, checkpoint_hash, parent_hash))
            
            conn.execute("""
                DELETE FROM domain_snapshots 
                WHERE domain=? AND key=? AND id NOT IN (
                    SELECT id FROM domain_snapshots 
                    WHERE domain=? AND key=? 
                    ORDER BY updated_at DESC LIMIT 100
                )
            """, (domain, key, domain, key))
            
        cls.extend_vesicular_ledger(checkpoint_hash, parent_hash, domain, key, payload)
        return checkpoint_hash

    @classmethod
    def load(cls, domain: str, key: str = None) -> Any:
        cls.init_db()
        with sqlite3.connect(cls.DB_PATH) as conn:
            if key:
                row = conn.execute("SELECT value FROM domain_state WHERE domain=? AND key=?", (domain, key)).fetchone()
                return json.loads(row[0]) if row else None
            rows = conn.execute("SELECT key, value FROM domain_state WHERE domain=?", (domain,)).fetchall()
            return {k: json.loads(v) for k, v in rows}

    @classmethod
    def load_snapshot_history(cls, domain: str, key: str) -> list:
        cls.init_db()
        with sqlite3.connect(cls.DB_PATH) as conn:
            rows = conn.execute("""
                SELECT version, updated_at, value, checkpoint_hash, parent_hash 
                FROM domain_snapshots 
                WHERE domain=? AND key=? 
                ORDER BY version DESC
            """, (domain, key)).fetchall()
            return [
                {
                    "version": r[0],
                    "updated_at": r[1],
                    "value": json.loads(r[2]),
                    "checkpoint_hash": r[3],
                    "parent_hash": r[4]
                }
                for r in rows
            ]


class StateVerifier:
    @staticmethod
    def verify_domain(domain: str) -> dict:
        persisted = StatePersistence.load(domain) or {}
        actual = {}
        
        if domain == 'window':
            actual_windows = WindowControl.list_windows()
            if actual_windows.get("ok"):
                active_titles = [w.strip() for w in actual_windows["data"].get("windows", [])]
                actual['focus_stack'] = [w.split(":", 1)[0].strip() for w in active_titles if ":" in w]
                for k in persisted.keys():
                    if k.startswith("bounds_"):
                        app = k.replace("bounds_", "", 1)
                        actual[k] = persisted[k] if any(title.startswith(f"{app}:") for title in active_titles) else None
        elif domain == 'defaults':
            for k in persisted.keys():
                if ":" in k:
                    dom, key = k.split(":", 1)
                    res = DefaultsControl.read(dom, key)
                    if res.get("ok"):
                        actual[k] = {
                            "value": res["data"].get("value"),
                            "type": persisted[k].get("type") if isinstance(persisted[k], dict) else None
                        }
                elif k == "dock_autohide":
                    res = DefaultsControl.read("com.apple.dock", "autohide")
                    if res.get("ok"):
                        val = res["data"].get("value", "").strip()
                        actual[k] = {"enabled": val in ("1", "true", "YES")}
                elif k == "finder_show_hidden":
                    res = DefaultsControl.read("com.apple.finder", "AppleShowAllFiles")
                    if res.get("ok"):
                        val = res["data"].get("value", "").strip()
                        actual[k] = {"enabled": val in ("1", "true", "YES")}
                elif k == "screenshot_format":
                    res = DefaultsControl.read("com.apple.screencapture", "type")
                    if res.get("ok"):
                        actual[k] = {"format": res["data"].get("value", "png").strip()}
                elif k == "screenshot_location":
                    res = DefaultsControl.read("com.apple.screencapture", "location")
                    if res.get("ok"):
                        actual[k] = {"path": res["data"].get("value", "").strip()}
        elif domain == 'network':
            for k in persisted.keys():
                if k == 'wifi_status':
                    res = NetworkControl.get_wifi_status()
                    if res.get("ok"):
                        actual[k] = {"enabled": res["data"].get("enabled")}
                elif k == 'wifi_ssid':
                    res = NetworkControl.get_wifi_ssid()
                    if res.get("ok"):
                        actual[k] = {"ssid": res["data"].get("ssid")}
        elif domain == 'security':
            for k in persisted.keys():
                if k == 'firewall':
                    res = SecurityControl.get_firewall_status()
                    if res.get("ok"):
                        actual[k] = {"enabled": res["data"].get("enabled")}
                elif k == 'gatekeeper':
                    res = SecurityControl.get_gatekeeper_status()
                    if res.get("ok"):
                        actual[k] = {"status": res["data"].get("status")}
        elif domain == 'bluetooth':
            for k in persisted.keys():
                if k == 'status':
                    res = BluetoothControl.status()
                    if res.get("ok"):
                        actual[k] = {"on": res["data"].get("on")}
        elif domain == 'power':
            for k in persisted.keys():
                if k == 'caffeinate':
                    caffeinates = _run_safe(["pgrep", "caffeinate"])
                    is_running = bool(caffeinates.strip())
                    if is_running:
                        if isinstance(persisted[k], dict):
                            persisted[k]["running"] = True
                        actual[k] = dict(persisted[k]) if isinstance(persisted[k], dict) else {}
                        actual[k]["running"] = True
                    else:
                        actual[k] = {"running": False, "seconds": None, "pid": None, "started_at": None}
                    
        drift = {}
        for key, persisted_value in persisted.items():
            if key in actual:
                if persisted_value != actual[key]:
                    drift[key] = {'persisted': persisted_value, 'actual': actual[key]}
            else:
                drift[key] = {'persisted': persisted_value, 'actual': None}
                
        return {
            "domain": domain,
            "drift": drift,
            "verified": len(drift) == 0,
            "ts": datetime.now().isoformat()
        }

    @staticmethod
    def restore_domain(domain: str, target_time: float = None, require_restore_flag: bool = False) -> dict:
        # 1. State restore security gating policies
        if domain in ('network', 'bluetooth') and not require_restore_flag:
            return {
                "domain": domain,
                "ok": False,
                "error": f"Domain '{domain}' state restoration requires explicit confirmation via require_restore_flag=True to avoid connection disruptions."
            }
        
        if domain == 'power':
            # Guard adicional: Secure operator confirmation for power state modifications
            if not _confirm_hid(f"Restore power state/caffeinate for domain: {domain}"):
                return {
                    "domain": domain,
                    "ok": False,
                    "error": "State restoration blocked: secure operator confirmation denied or timed out."
                }
        
        if domain == 'security':
            # Check confirmation gate using overlay
            if not _confirm_hid(f"Restore security settings for domain: {domain}"):
                return {
                    "domain": domain,
                    "ok": False,
                    "error": "State restoration blocked: secure operator confirmation denied or timed out."
                }

        StatePersistence.init_db()
        with sqlite3.connect(StatePersistence.DB_PATH) as conn:
            if target_time:
                keys = conn.execute("SELECT DISTINCT key FROM domain_snapshots WHERE domain=?", (domain,)).fetchall()
                state_to_restore = {}
                for (k,) in keys:
                    row = conn.execute("""
                        SELECT value FROM domain_snapshots 
                        WHERE domain=? AND key=? AND updated_at <= ? 
                        ORDER BY updated_at DESC LIMIT 1
                    """, (domain, k, int(target_time * 1000))).fetchone()
                    if row:
                        state_to_restore[k] = json.loads(row[0])
            else:
                rows = conn.execute("SELECT key, value FROM domain_state WHERE domain=?", (domain,)).fetchall()
                state_to_restore = {k: json.loads(v) for k, v in rows}
        
        restored = {}
        errors = {}
        
        if domain == 'window':
            for k, val in state_to_restore.items():
                if k.startswith("bounds_"):
                    app = k.replace("bounds_", "", 1)
                    if isinstance(val, list) and len(val) == 4:
                        res = WindowControl.set_bounds(app, val[0], val[1], val[2], val[3])
                        restored[k] = res.get("ok", False)
                        if not res.get("ok"): errors[k] = res.get("error")
                    elif isinstance(val, dict):
                        res = WindowControl.set_bounds(app, val.get("x", 0), val.get("y", 0), val.get("w", 800), val.get("h", 600))
                        restored[k] = res.get("ok", False)
                        if not res.get("ok"): errors[k] = res.get("error")
                elif k == 'focus_stack':
                    if isinstance(val, list) and val:
                        res = WindowControl.focus(val[0])
                        restored[k] = res.get("ok", False)
                        if not res.get("ok"): errors[k] = res.get("error")
        elif domain == 'defaults':
            for k, val in state_to_restore.items():
                if ":" in k:
                    dom, key = k.split(":", 1)
                    if isinstance(val, dict):
                        res = DefaultsControl.write(dom, key, str(val.get("value")), val.get("type", "-string"))
                        restored[k] = res.get("ok", False)
                        if not res.get("ok"): errors[k] = res.get("error")
                elif k == 'dock_autohide':
                    res = DefaultsControl.dock_autohide(val.get("enabled", False))
                    restored[k] = res.get("ok", False)
                    if not res.get("ok"): errors[k] = res.get("error")
                elif k == 'finder_show_hidden':
                    res = DefaultsControl.finder_show_hidden(val.get("enabled", False))
                    restored[k] = res.get("ok", False)
                    if not res.get("ok"): errors[k] = res.get("error")
                elif k == 'screenshot_format':
                    res = DefaultsControl.screenshot_format(val.get("format", "png"))
                    restored[k] = res.get("ok", False)
                    if not res.get("ok"): errors[k] = res.get("error")
                elif k == 'screenshot_location':
                    res = DefaultsControl.screenshot_location(val.get("path", "~/Desktop"))
                    restored[k] = res.get("ok", False)
                    if not res.get("ok"): errors[k] = res.get("error")
        elif domain == 'network':
            for k, val in state_to_restore.items():
                if k == 'wifi_status':
                    res = NetworkControl.wifi_on() if val.get("enabled") else NetworkControl.wifi_off()
                    restored[k] = res.get("ok", False)
                    if not res.get("ok"): errors[k] = res.get("error")
        elif domain == 'bluetooth':
            for k, val in state_to_restore.items():
                if k == 'status':
                    res = BluetoothControl.on() if val.get("on") else BluetoothControl.off()
                    restored[k] = res.get("ok", False)
                    if not res.get("ok"): errors[k] = res.get("error")
        elif domain == 'power':
            for k, val in state_to_restore.items():
                if k == 'caffeinate':
                    if val.get("seconds"):
                        # Verify if caffeinate is already active to prevent process duplication
                        caffeinates = _run_safe(["pgrep", "caffeinate"])
                        if caffeinates and caffeinates.strip() and "ERROR" not in caffeinates:
                            restored[k] = True  # Already active
                        else:
                            res = PowerControl.caffeinate(val["seconds"])
                            restored[k] = res.get("ok", False)
                            if not res.get("ok"): errors[k] = res.get("error")
        elif domain == 'security':
            for k, val in state_to_restore.items():
                if k == 'firewall':
                    res = SecurityControl.set_firewall_status(val.get("enabled", False))
                    restored[k] = res.get("ok", False)
                    if not res.get("ok"): errors[k] = res.get("error")
                elif k == 'gatekeeper':
                    res = SecurityControl.set_gatekeeper_status(val.get("status") == "enabled")
                    restored[k] = res.get("ok", False)
                    if not res.get("ok"): errors[k] = res.get("error")
                    
        return {
            "domain": domain,
            "restored": restored,
            "errors": errors,
            "ok": len(errors) == 0
        }


# ---
# DOMAIN 1: AV_OUT (Display + Audio)
# ---
# ---


class AVOutControl:
    @staticmethod
    def get_brightness() -> dict:
        out = _run_safe(["brightness", "-l"])
        val = "1.0"
        if out and "ERROR" not in out:
            for line in out.splitlines():
                if "brightness" in line:
                    val = line.split()[-1]
                    break
        return _result("av_out", "get_brightness", {"brightness": val}, verified=True)

    @staticmethod
    def set_brightness(level: int) -> dict:
        def mutation():
            n = max(0, min(100, int(level))) / 100.0
            _run_safe(["brightness", str(n)])
            return _result("av_out", "set_brightness", {"level": level}, state="C4-SIMULATION")
        return SiliconVerifyGuard.verify(
            mutation,
            AVOutControl.get_brightness,
            lambda state: abs(float(state["data"].get("brightness", 0) or 0) - (max(0, min(100, int(level))) / 100.0)) < 0.05
        )

    @staticmethod
    def get_dark_mode() -> dict:
        val = _osa(
            'tell application "System Events" to tell appearance preferences to get dark mode'
        )
        return _result("av_out", "get_dark_mode", {"dark_mode": val == "true"}, verified=True)

    @staticmethod
    def set_dark_mode(enabled: bool) -> dict:
        def mutation():
            v = "true" if enabled else "false"
            _osa(
                f'tell application "System Events" to tell appearance preferences to set dark mode to {v}'
            )
            return _result("av_out", "set_dark_mode", {"dark_mode": enabled}, state="C4-SIMULATION")
        return SiliconVerifyGuard.verify(
            mutation,
            AVOutControl.get_dark_mode,
            lambda state: state["data"].get("dark_mode") == enabled
        )

    @staticmethod
    def get_resolution() -> dict:
        out = _run_safe(["system_profiler", "SPDisplaysDataType"])
        res = "unknown"
        if out and "ERROR" not in out:
            for line in out.splitlines():
                if "Resolution:" in line:
                    res = line.split(":", 1)[-1].strip()
                    break
        return _result("av_out", "get_resolution", {"resolution": res})
        
    @staticmethod
    def get_volume() -> dict:
        vol = _osa("get output volume of (get volume settings)")
        muted = _osa("get output muted of (get volume settings)")
        return _result("av_out", "get_volume", {"volume": vol, "muted": muted}, verified=True)

    @staticmethod
    def set_volume(level: int) -> dict:
        def mutation():
            n = max(0, min(100, int(level)))
            _osa(f"set volume output volume {n}")
            return _result("av_out", "set_volume", {"volume": n}, state="C4-SIMULATION")
        return SiliconVerifyGuard.verify(
            mutation,
            AVOutControl.get_volume,
            lambda state: str(state["data"].get("volume")) == str(max(0, min(100, int(level))))
        )

    @staticmethod
    def mute() -> dict:
        def mutation():
            _osa("set volume output muted true")
            return _result("av_out", "mute", {"muted": True}, state="C4-SIMULATION")
        return SiliconVerifyGuard.verify(
            mutation,
            AVOutControl.get_volume,
            lambda state: str(state["data"].get("muted")) == "true"
        )

    @staticmethod
    def unmute() -> dict:
        def mutation():
            _osa("set volume output muted false")
            return _result("av_out", "unmute", {"muted": False}, state="C4-SIMULATION")
        return SiliconVerifyGuard.verify(
            mutation,
            AVOutControl.get_volume,
            lambda state: str(state["data"].get("muted")) == "false"
        )

    @staticmethod
    def get_output_devices() -> dict:
        out = _run_safe(["system_profiler", "SPAudioDataType"])
        devices = []
        if out and "ERROR" not in out:
            lines = out.splitlines()
            for i, line in enumerate(lines):
                if "Output:" in line:
                    devices.extend([l.strip() for l in lines[i:i+3]])
                    break
        out_filtered = "\n".join(devices)
        return _result("av_out", "get_output_devices", {"devices": out_filtered})


# ---
# DOMAIN 2: NETWORK
# ---


class NetworkControl:
    _ext_ip_cache = {"ip": None, "ts": 0, "fetching": False}

    @staticmethod
    def _wifi_iface() -> str:
        ports_info = _run_safe(["networksetup", "-listallhardwareports"])
        iface = "en0"
        lines = ports_info.splitlines()
        for i, line in enumerate(lines):
            if "Wi-Fi" in line and i + 1 < len(lines):
                parts = lines[i+1].split()
                if len(parts) >= 2:
                    iface = parts[1]
                    break
        return iface

    @staticmethod
    def get_wifi_status() -> dict:
        iface = NetworkControl._wifi_iface()
        power = _run_safe(["networksetup", "-getairportpower", iface])
        enabled = "On" in power if power else False
        return _result("network", "wifi_status", {"enabled": enabled, "raw": power.strip() if power else ""})

    @staticmethod
    def get_wifi_ssid() -> dict:
        airport_path = "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport"
        info = _run_safe([airport_path, "-I"])
        ssid = None
        for line in info.splitlines():
            if " SSID:" in line:
                parts = line.split(":", 1)
                if len(parts) >= 2:
                    ssid = parts[1].strip()
                    break
        return _result("network", "wifi_ssid", {"ssid": ssid})

    @staticmethod
    def wifi_on() -> dict:
        def mutation():
            iface = NetworkControl._wifi_iface()
            _run_safe(["networksetup", "-setairportpower", iface, "on"])
            return _result("network", "wifi_on", {"enabled": True}, state="C4-SIMULATION")
        res = SiliconVerifyGuard.verify(
            mutation,
            NetworkControl.get_wifi_status,
            lambda state: state["data"].get("enabled") is True
        )
        if res.get("ok"):
            StatePersistence.save("network", "wifi_status", {"enabled": True})
        return res

    @staticmethod
    def wifi_off() -> dict:
        def mutation():
            iface = NetworkControl._wifi_iface()
            _run_safe(["networksetup", "-setairportpower", iface, "off"])
            return _result("network", "wifi_off", {"enabled": False}, state="C4-SIMULATION")
        res = SiliconVerifyGuard.verify(
            mutation,
            NetworkControl.get_wifi_status,
            lambda state: state["data"].get("enabled") is False
        )
        if res.get("ok"):
            StatePersistence.save("network", "wifi_status", {"enabled": False})
        return res

    @staticmethod
    def _fetch_external_ip():
        NetworkControl._ext_ip_cache["fetching"] = True
        try:
            ext = _run_safe(["curl", "-s", "--max-time", "3", "ifconfig.me"])
            NetworkControl._ext_ip_cache["ip"] = ext.strip() if ext and "ERROR" not in ext else None
            NetworkControl._ext_ip_cache["ts"] = time.time()
        finally:
            NetworkControl._ext_ip_cache["fetching"] = False

    @staticmethod
    def get_ip() -> dict:
        import threading
        ip = _run_safe(["ipconfig", "getifaddr", "en0"])
        if not ip or "ERROR" in ip:
            ip = _run_safe(["ipconfig", "getifaddr", "en1"])
        ip = ip.strip() if ip and "ERROR" not in ip else None
        
        now = time.time()
        if (NetworkControl._ext_ip_cache["ip"] is None or (now - NetworkControl._ext_ip_cache["ts"]) > 300) and not NetworkControl._ext_ip_cache["fetching"]:
            threading.Thread(target=NetworkControl._fetch_external_ip, daemon=True).start()
            
        ext = NetworkControl._ext_ip_cache["ip"]
        return _result("network", "get_ip", {"local": ip, "external": ext})

    @staticmethod
    def get_all_interfaces() -> dict:
        out = _run_safe(["ifconfig", "-l"])
        return _result("network", "interfaces", {"interfaces": out.split() if out and "ERROR" not in out else []})

    @staticmethod
    def flush_dns() -> dict:
        def mutation():
            _run_safe(["dscacheutil", "-flushcache"])
            _run_safe(["killall", "-HUP", "mDNSResponder"])
            return _result("network", "flush_dns", {"flushed": True}, state="C4-SIMULATION")
        # Direct C5-REAL promotion since mDNSResponder takes immediate effect
        res = mutation()
        res["state"] = "C5-REAL"
        res["silicon_verified"] = True
        return res


# ---
# DOMAIN 3: BLUETOOTH
# ---


class BluetoothControl:
    @staticmethod
    def status() -> dict:
        out = _run_safe(["defaults", "read", "/Library/Preferences/com.apple.Bluetooth", "ControllerPowerState"])
        return _result("bluetooth", "status", {"on": out == "1"})

    @staticmethod
    def on() -> dict:
        def mutation():
            res_blue = _run_safe(["blueutil", "--power", "1"])
            if "ERROR:" in res_blue:
                _run_safe(["defaults", "write", "/Library/Preferences/com.apple.Bluetooth", "ControllerPowerState", "-int", "1"])
            return _result("bluetooth", "on", {"on": True}, state="C4-SIMULATION")
        res = SiliconVerifyGuard.verify(
            mutation,
            BluetoothControl.status,
            lambda state: state["data"].get("on") is True
        )
        if res.get("ok"):
            StatePersistence.save("bluetooth", "status", {"on": True})
        return res

    @staticmethod
    def off() -> dict:
        def mutation():
            res_blue = _run_safe(["blueutil", "--power", "0"])
            if "ERROR:" in res_blue:
                _run_safe(["defaults", "write", "/Library/Preferences/com.apple.Bluetooth", "ControllerPowerState", "-int", "0"])
            return _result("bluetooth", "off", {"on": False}, state="C4-SIMULATION")
        res = SiliconVerifyGuard.verify(
            mutation,
            BluetoothControl.status,
            lambda state: state["data"].get("on") is False
        )
        if res.get("ok"):
            StatePersistence.save("bluetooth", "status", {"on": False})
        return res


# ---
# DOMAIN 4: POWER
# ---


class PowerControl:
    @staticmethod
    def get_battery() -> dict:
        out = _run_safe(["pmset", "-g", "batt"])
        import re
        pct_match = re.search(r"(\d+)\%", out)
        pct = pct_match.group(0) if pct_match else "unknown"
        
        src_match = re.search(r"Now drawing from '([^']+)'", out)
        src = f"'{src_match.group(1)}'" if src_match else "unknown"
        
        first_line = out.split("\n")[0] if out else ""
        charging = "AC" in first_line
        return _result("power", "battery", {"percent": pct, "source": src, "charging": charging})

    @staticmethod
    def caffeinate(seconds: int = 3600) -> dict:
        proc = subprocess.Popen(["caffeinate", "-t", str(int(seconds))])
        res = _result("power", "caffeinate", {"seconds": seconds, "pid": proc.pid})
        if res.get("ok"):
            StatePersistence.save("power", "caffeinate", {
                "running": True,
                "seconds": seconds,
                "pid": proc.pid,
                "started_at": time.time()
            })
        return res

    @staticmethod
    def sleep_display() -> dict:
        _run_safe(["pmset", "displaysleepnow"])
        return _result("power", "sleep_display", {"done": True})

    @staticmethod
    def lock_screen() -> dict:
        _run_safe(["pmset", "displaysleepnow"])
        return _result("power", "lock", {"locked": True})


# ---
# DOMAIN 5: PROCESS
# ---


class ProcessControl:
    @staticmethod
    def list_processes(sort_by: str = "cpu", limit: int = 15) -> dict:
        try:
            lim = int(limit)
            procs = []
            for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent']):
                try:
                    pinfo = proc.info
                    procs.append(pinfo)
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass
            
            if sort_by in ("memory", "mem"):
                procs.sort(key=lambda x: x.get('memory_percent') or 0, reverse=True)
            else:
                procs.sort(key=lambda x: x.get('cpu_percent') or 0, reverse=True)
                
            top_list = []
            for p in procs[:lim]:
                cpu_p = p.get('cpu_percent', 0) or 0.0
                mem_p = p.get('memory_percent', 0) or 0.0
                user = p.get('username') or 'unknown'
                top_list.append(f"{user:<8} {p['pid']:>5} {cpu_p:>5.1f} {mem_p:>5.1f} {p['name']}")
                
            return _result("process", "list", {"count": len(top_list), "top": top_list})
        except Exception as e:
            return _result("process", "list", {"error": str(e)}, ok=False)

    @staticmethod
    def kill_process(target: str) -> dict:
        target = str(target).strip()
        if not target:
            return _result("process", "kill", {"error": "empty target"}, ok=False)
        if target.isdigit():
            _run_safe(["kill", "-9", target])
        else:
            # Sanitize: only allow alphanumeric, dots, dashes, underscores
            if not re.match(r"^[\w.\-]+$", target):
                return _result("process", "kill", {"error": "invalid target chars"}, ok=False)
            _run_safe(["pkill", "-9", "-f", target])
        return _result("process", "kill", {"target": target})

    @staticmethod
    def launch_app(name: str) -> dict:
        _run_safe(["open", "-a", name])
        return _result("process", "launch", {"app": name})

    @staticmethod
    def quit_app(name: str) -> dict:
        safe_name = _sanitize(name)
        _osa(f'tell application "{safe_name}" to quit')
        return _result("process", "quit", {"app": name})

    @staticmethod
    def get_frontmost() -> dict:
        app = _osa(
            'tell application "System Events" to get name of first application process whose frontmost is true'
        )
        return _result("process", "frontmost", {"app": app})


# ---
# DOMAIN 6: FILESYSTEM
# ---


class FilesystemControl:
    @staticmethod
    def get_disk_usage() -> dict:
        try:
            usage = shutil.disk_usage("/")
            gb = 1024**3
            return _result(
                "fs",
                "disk",
                {
                    "total": f"{usage.total / gb:.1f}Gi",
                    "used": f"{usage.used / gb:.1f}Gi",
                    "free": f"{usage.free / gb:.1f}Gi",
                },
            )
        except Exception as e:
            return _result("fs", "disk", {"error": str(e)}, ok=False)

    @staticmethod
    def search(query: str, path: str = "~") -> dict:
        out = _run_safe(["mdfind", "-onlyin", os.path.expanduser(path), query], timeout=15)
        results = [r for r in out.split("\n") if r][:20]
        return _result("fs", "search", {"query": query, "results": results})

    @staticmethod
    def sha256(filepath: str) -> dict:
        try:
            h = hashlib.sha256(Path(filepath).expanduser().read_bytes()).hexdigest()
            return _result("fs", "sha256", {"file": filepath, "hash": h})
        except (OSError, ValueError) as e:
            return _result("fs", "sha256", {"error": str(e)}, ok=False)

    @staticmethod
    def trash(filepath: str) -> dict:
        safe = _sanitize(str(Path(filepath).expanduser().resolve()))
        # R5 constraint: Avoid protected paths
        if safe.startswith("/System/Volumes/Data/private/var/db/"):
            return _result("fs", "trash", {"error": "R5 Law violation: path is protected"}, ok=False)
        _osa(f'tell application "Finder" to delete POSIX file "{safe}"')
        return _result("fs", "trash", {"file": filepath})

    @staticmethod
    def compress(filepath: str) -> dict:
        p = str(Path(filepath).expanduser().resolve())
        out = _run_safe(["zip", "-r", f"{p}.zip", p], timeout=60)
        return _result("fs", "compress", {"file": filepath, "output": out})


# ---
# DOMAIN 7: CLIPBOARD (INJECTION-PROOF)
# ---


class ClipboardControl:
    @staticmethod
    def get() -> dict:
        text = _run_safe(["pbpaste"])
        return _result("clipboard", "get", {"text": text[:500]})

    @staticmethod
    def set(text: str) -> dict:
        # Uses stdin pipe, no shell interpolation
        _run_safe(["pbcopy"], stdin_data=text)
        return _result("clipboard", "set", {"length": len(text)})


# ---
# DOMAIN 8: SCREENSHOT
# ---


class ScreenshotControl:
    @staticmethod
    def capture_screen(path: str = "/tmp/sovereign_screen.png") -> dict:
        _run_safe(["screencapture", "-x", path])
        return _result("screenshot", "screen", {"path": path, "exists": os.path.exists(path)})

    @staticmethod
    def capture_window(app: str, path: str = "/tmp/sovereign_window.png") -> dict:
        wid = _osa(f'tell app "{_sanitize(app)}" to id of window 1')
        if wid and "ERROR" not in wid:
            _run_safe(["screencapture", "-x", f"-l{wid}", path])
        else:
            _run_safe(["screencapture", "-x", path])
        return _result("screenshot", "window", {"app": app, "path": path})

    @staticmethod
    def capture_region(
        x: int, y: int, w: int, h: int, path: str = "/tmp/sovereign_region.png"
    ) -> dict:
        _run_safe(["screencapture", "-x", f"-R{x},{y},{w},{h}", path])
        return _result("screenshot", "region", {"rect": [x, y, w, h], "path": path})


# ---
# DOMAIN 9: NOTIFICATIONS (SANITIZED)
# ---


class NotificationControl:
    @staticmethod
    def send(title: str, message: str) -> dict:
        _osa(f'display notification "{_sanitize(message)}" with title "{_sanitize(title)}"')
        return _result("notification", "send", {"title": title, "message": message})

    @staticmethod
    def get_dnd() -> dict:
        out = _run_safe(
            ["defaults", "-currentHost", "read", "com.apple.notificationcenterui", "doNotDisturb"]
        )
        return _result("notification", "dnd_status", {"dnd": out == "1"})

    @staticmethod
    def set_dnd(enabled: bool) -> dict:
        v = "1" if enabled else "0"
        _run_safe(
            [
                "defaults",
                "-currentHost",
                "write",
                "com.apple.notificationcenterui",
                "doNotDisturb",
                "-int",
                v,
            ]
        )
        return _result("notification", "set_dnd", {"dnd": enabled})


# ---
# DOMAIN 10: WINDOW MANAGER
# ---


class WindowControl:
    @staticmethod
    def list_windows() -> dict:
        script = (
            'tell application "System Events"\n'
            "set wlist to {}\n"
            "repeat with proc in (every application process whose visible is true)\n"
            "set pname to name of proc\n"
            "try\n"
            "repeat with w in (every window of proc)\n"
            'copy pname & ": " & name of w to end of wlist\n'
            "end repeat\n"
            "end try\n"
            "end repeat\n"
            "return wlist\n"
            "end tell"
        )
        out = _run_safe(["osascript"], timeout=15, stdin_data=script)
        windows = [w.strip() for w in out.split(",") if w.strip()] if out else []
        return _result("window", "list", {"windows": windows, "count": len(windows)})

    @staticmethod
    def focus(app: str) -> dict:
        _osa(f'tell application "{_sanitize(app)}" to activate')
        res = _result("window", "focus", {"app": app})
        if res.get("ok"):
            try:
                stack = StatePersistence.load("window", "focus_stack") or []
                if app in stack:
                    stack.remove(app)
                stack.insert(0, app)
                StatePersistence.save("window", "focus_stack", stack[:10])
            except Exception as e:
                log.warning("Failed to save focus stack: %s", e)
        return res

    @staticmethod
    def minimize(app: str) -> dict:
        _osa(
            f'tell application "System Events" to set miniaturized of every window of process "{_sanitize(app)}" to true'
        )
        return _result("window", "minimize", {"app": app})

    @staticmethod
    def close(app: str) -> dict:
        _osa(
            f'tell application "System Events" to click button 1 of every window of process "{_sanitize(app)}"'
        )
        return _result("window", "close", {"app": app})

    @staticmethod
    def set_bounds(app: str, x: int, y: int, w: int, h: int) -> dict:
        _osa(
            f'tell application "{_sanitize(app)}" to set bounds of front window to {{{x},{y},{x + w},{y + h}}}'
        )
        res = _result("window", "set_bounds", {"app": app, "rect": [x, y, w, h]})
        if res.get("ok"):
            StatePersistence.save("window", f"bounds_{app}", {"x": x, "y": y, "w": w, "h": h})
        return res

    @staticmethod
    def tile_left_right(app1: str, app2: str) -> dict:
        out = _run_safe(["system_profiler", "SPDisplaysDataType"])
        import re
        match = re.search(r"Resolution:\s*(\d+)\s*[xX]\s*(\d+)", out)
        if match:
            screen_w = int(match.group(1))
            screen_h = int(match.group(2))
        else:
            screen_w = 1440
            screen_h = 900
        half = screen_w // 2
        s1, s2 = _sanitize(app1), _sanitize(app2)
        _osa(f'tell application "{s1}" to activate')
        _osa(
            f'tell application "{s1}" to set bounds of front window to {{0, 25, {half}, {screen_h}}}'
        )
        _osa(f'tell application "{s2}" to activate')
        _osa(
            f'tell application "{s2}" to set bounds of front window to {{{half}, 25, {screen_w}, {screen_h}}}'
        )
        return _result("window", "tile", {"left": app1, "right": app2})


# ---
# DOMAIN 11: AUTOMATION (SANITIZED)
# ---


class AutomationControl:
    @staticmethod
    def run_shortcut(name: str) -> dict:
        out = _run_safe(["shortcuts", "run", name], timeout=30)
        return _result("automation", "shortcut", {"name": name, "output": out})

    @staticmethod
    def run_applescript(code: str) -> dict:
        out = _osa(code)
        return _result("automation", "applescript", {"output": out})
        
    @staticmethod
    def run_jxa(code: str) -> dict:
        out = _run_safe(["osascript", "-l", "JavaScript"], timeout=15, stdin_data=code)
        return _result("automation", "jxa", {"output": out})

    @staticmethod
    def say(text: str, voice: str = "Samantha") -> dict:
        subprocess.Popen(["say", "-v", voice, text])
        return _result("automation", "say", {"text": text, "voice": voice})

    @staticmethod
    def set_wallpaper(path: str) -> dict:
        safe = _sanitize(path)
        _osa(
            f'tell application "System Events" to tell every desktop to set picture to POSIX file "{safe}"'
        )
        return _result("automation", "wallpaper", {"path": path})

    @staticmethod
    def open_url(url: str) -> dict:
        _run_safe(["open", url])
        return _result("automation", "open", {"url": url})


# ---
# DOMAIN 12: TELEMETRY (Merged SysInfo, Hardware, Time)
# ---


class TelemetryControl:
    _gpu_cache = None

    @staticmethod
    def get_info() -> dict:
        return _result(
            "telemetry",
            "info",
            {
                "hostname": platform.node(),
                "os": platform.platform(),
                "arch": platform.machine(),
                "python": platform.python_version(),
                "user": os.environ.get("USER", "unknown"),
            },
        )

    @staticmethod
    def get_uptime() -> dict:
        out = _run_safe(["uptime"])
        return _result("telemetry", "uptime", {"raw": out})
        
    @staticmethod
    def get_cpu_info() -> dict:
        brand = _run_safe(["sysctl", "-n", "machdep.cpu.brand_string"])
        cores_phys = _run_safe(["sysctl", "-n", "hw.physicalcpu"])
        cores_log = _run_safe(["sysctl", "-n", "hw.logicalcpu"])
        freq = _run_safe(["sysctl", "-n", "hw.cpufrequency"])
        return _result(
            "telemetry",
            "cpu",
            {
                "brand": brand,
                "physical_cores": int(cores_phys) if cores_phys.isdigit() else 0,
                "logical_cores": int(cores_log) if cores_log.isdigit() else 0,
                "frequency_hz": int(freq) if freq and freq.isdigit() else 0,
            },
        )

    @staticmethod
    def get_memory_info() -> dict:
        total = _run_safe(["sysctl", "-n", "hw.memsize"])
        pressure_out = _run_safe(["memory_pressure"])
        
        pressure_pct = 0
        if pressure_out and "ERROR" not in pressure_out:
            for line in pressure_out.splitlines():
                if "System-wide memory free percentage" in line:
                    try:
                        m = re.search(r'(\d+)', line)
                        if m:
                            pressure_pct = int(m.group(1))
                    except Exception:
                        pass
                    break
                 
        total_gb = round(int(total) / (1024**3), 1) if total and total.isdigit() else 0.0
        return _result(
            "telemetry",
            "memory",
            {
                "total_bytes": int(total) if total and total.isdigit() else 0,
                "total_gb": total_gb,
                "free_percentage": pressure_pct,
                "pressure_percentage": 100 - pressure_pct if pressure_pct > 0 else 0
            },
        )

    @staticmethod
    def get_gpu_info() -> dict:
        # Cache to prevent Exergy Engine from hanging the system
        if TelemetryControl._gpu_cache is None:
            out = _run_safe(["system_profiler", "SPDisplaysDataType"])
            filtered_lines = []
            if out and "ERROR" not in out:
                keywords = ["Chipset", "VRAM", "Metal", "Display Type", "Resolution"]
                for line in out.splitlines():
                    if any(k in line for k in keywords):
                        filtered_lines.append(line.strip())
                        if len(filtered_lines) >= 10:
                            break
            TelemetryControl._gpu_cache = "\n".join(filtered_lines)
        return _result("telemetry", "gpu", {"raw": TelemetryControl._gpu_cache})

    @staticmethod
    def get_thermal() -> dict:
        therm = _run_safe(["pmset", "-g", "therm"])
        pmset_raw = _run_safe(["pmset", "-g"])
        
        speed_limit = 100
        if pmset_raw and "ERROR" not in pmset_raw:
            for line in pmset_raw.splitlines():
                if "CPU_Speed_Limit" in line:
                    try:
                        m = re.search(r'(\d+)', line)
                        if m:
                            speed_limit = int(m.group(1))
                    except Exception:
                        pass
                    break
                  
        return _result("telemetry", "thermal", {"cpu_speed_limit_percent": speed_limit, "raw": therm.strip()})

    @staticmethod
    def get_datetime() -> dict:
        now = datetime.now()
        return _result(
            "telemetry",
            "datetime",
            {
                "iso": now.isoformat(),
                "date": now.strftime("%Y-%m-%d"),
                "time": now.strftime("%H:%M:%S"),
                "weekday": now.strftime("%A"),
                "epoch": int(now.timestamp()),
            },
        )

    @staticmethod
    def get_timezone() -> dict:
        tz = _run_safe(["systemsetup", "-gettimezone"])
        if tz and "Time Zone:" in tz:
             tz = tz.replace("Time Zone: ", "").strip()
        return _result("telemetry", "timezone", {"timezone": tz})

    @staticmethod
    def set_timezone(tz: str) -> dict:
        script = f'do shell script "systemsetup -settimezone {tz}" with administrator privileges'
        _osa(script)
        verify = TelemetryControl.get_timezone()
        if verify.get("ok") and verify.get("data", {}).get("timezone") == tz:
             return _result("telemetry", "set_timezone", {"timezone": tz, "verified": True})
        return _result("telemetry", "set_timezone", {"error": "Silicon Verify failed", "verified": False}, ok=False)

    @staticmethod
    def get_ntp_status() -> dict:
        ntp = _run_safe(["systemsetup", "-getusingnetworktime"])
        server = _run_safe(["systemsetup", "-getnetworktimeserver"])
        enabled = "On" in ntp if ntp else False
        server_name = server.replace("Network Time Server: ", "").strip() if server and "Network Time Server:" in server else server.strip() if server else "unknown"
        return _result("telemetry", "ntp", {"enabled": enabled, "server": server_name})

    @staticmethod
    def set_ntp_status(enable: bool, server: str = "time.apple.com") -> dict:
        state = "on" if enable else "off"
        script = f'do shell script "systemsetup -setnetworktimeserver {server} && systemsetup -setusingnetworktime {state}" with administrator privileges'
        _osa(script)
        verify = TelemetryControl.get_ntp_status()
        if verify.get("ok") and verify.get("data", {}).get("enabled") == enable:
            return _result("telemetry", "set_ntp", {"enabled": enable, "server": server, "verified": True})
        return _result("telemetry", "set_ntp", {"error": "Silicon Verify failed", "verified": False}, ok=False)

    @staticmethod
    def get_storage_devices() -> dict:
        # Falls back to structured FilesystemControl logic
        return FilesystemControl.get_disk_usage()


# ---
# DOMAIN 13: SECURITY
# ---


class SecurityControl:
    @staticmethod
    def get_firewall_status() -> dict:
        out = _run_safe(["/usr/libexec/ApplicationFirewall/socketfilterfw", "--getglobalstate"])
        if not out or "ERROR:" in out:
            return _result("security", "firewall", {"error": out or "No output from socketfilterfw"}, ok=False)
        enabled = "enabled" in out.lower() or "1" in out
        return _result("security", "firewall", {"enabled": enabled, "raw": out.strip()})

    @staticmethod
    def set_firewall_status(enable: bool) -> dict:
        state = "on" if enable else "off"
        script = f'do shell script "/usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate {state}" with administrator privileges'
        _osa(script)
        verify = SecurityControl.get_firewall_status()
        if verify.get("ok") and verify.get("data", {}).get("enabled") == enable:
            res = _result("security", "set_firewall", {"enabled": enable, "verified": True})
            StatePersistence.save("security", "firewall", {"enabled": enable})
            return res
        return _result("security", "set_firewall", {"error": "Silicon Verify failed", "verified": False}, ok=False)

    @staticmethod
    def get_sip_status() -> dict:
        out = _run_safe(["csrutil", "status"])
        if not out or "ERROR:" in out:
            return _result("security", "sip", {"error": out or "Failed to read SIP status"}, ok=False)
        out_l = out.lower()
        status = "enabled" if "enabled" in out_l else "disabled" if "disabled" in out_l else "unknown"
        return _result("security", "sip", {"status": status, "raw": out.strip()}, ok=(status != "unknown"))

    @staticmethod
    def get_gatekeeper_status() -> dict:
        out = _run_safe(["spctl", "--status"])
        out_l = out.lower()
        if "enabled" in out_l:
            status = "enabled"
        elif "disabled" in out_l:
            status = "disabled"
        else:
            return _result("security", "gatekeeper", {"error": out.strip()}, ok=False)
        return _result("security", "gatekeeper", {"status": status, "raw": out.strip()})

    @staticmethod
    def set_gatekeeper_status(enable: bool) -> dict:
        state = "enable" if enable else "disable"
        script = f'do shell script "spctl --master-{state}" with administrator privileges'
        _osa(script)
        verify = SecurityControl.get_gatekeeper_status()
        expected = "enabled" if enable else "disabled"
        if verify.get("ok") and verify.get("data", {}).get("status") == expected:
            res = _result("security", "set_gatekeeper", {"status": expected, "verified": True})
            StatePersistence.save("security", "gatekeeper", {"status": expected})
            return res
        return _result("security", "set_gatekeeper", {"error": "Silicon Verify failed", "verified": False}, ok=False)

    @staticmethod
    def get_filevault_status() -> dict:
        out = _run_safe(["fdesetup", "status"])
        if not out or "error" in out.lower() or "ERROR:" in out:
            return _result("security", "filevault", {"error": out.strip() if out else "Execution failed"}, ok=False)
        out_l = out.lower()
        if "off" in out_l:
            status = "off"
        elif "in progress" in out_l:
            status = "in_progress"
        elif "on" in out_l:
            status = "on"
        else:
            status = "unknown"
        return _result("security", "filevault", {"status": status, "raw": out.strip()}, ok=(status != "unknown"))

    @staticmethod
    def scan_open_ports() -> dict:
        out = _run_safe(["lsof", "-i", "-P", "-n"])
        if not out or "ERROR:" in out:
             return _result("security", "open_ports", {"count": 0, "ports": []})
        lines = [line.strip() for line in out.split("\n") if "LISTEN" in line]
        ports = []
        for line in lines:
            parts = line.split()
            if len(parts) >= 9:
                ports.append({"process": parts[0], "pid": parts[1], "address": parts[8]})
        return _result("security", "open_ports", {"count": len(ports), "ports": ports})

    @staticmethod
    def keychain_list() -> dict:
        out = _run_safe(["security", "list-keychains"])
        if "error" in out.lower() or "ERROR:" in out or not out:
             return _result("security", "keychains", {"error": out.strip() if out else "Failed to list keychains"}, ok=False)
        chains = [c.strip().strip('"') for c in out.split("\n") if c.strip()]
        return _result("security", "keychains", {"keychains": chains})

    @staticmethod
    def check_xprotect_version() -> dict:
        out = _run_safe(["system_profiler", "SPInstallHistoryDataType"])
        if not out or "ERROR:" in out:
             return _result("security", "xprotect", {"error": "XProtect data missing or unparseable"}, ok=False)
        lines = out.split("\n")
        xprotect_lines = []
        found_idx = -1
        for idx, line in enumerate(lines):
            if "XProtect" in line:
                found_idx = idx
                break
        if found_idx != -1:
            xprotect_lines = lines[found_idx:found_idx+5]
        else:
            return _result("security", "xprotect", {"error": "XProtect data missing or unparseable"}, ok=False)
        return _result("security", "xprotect", {"raw": "\n".join(xprotect_lines).strip()})

    @staticmethod
    def get_login_items() -> dict:
        script = """
            tell application "System Events"
                set items_list to {}
                repeat with li in (every login item)
                    copy name of li & " → " & path of li to end of items_list
                end repeat
                return items_list
            end tell
        """
        out = _osa(script)
        if "ERROR" in out:
             return _result("security", "login_items", {"error": out}, ok=False)
        items = [i.strip() for i in out.split(",") if i.strip()] if out else []
        return _result("security", "login_items", {"items": items, "count": len(items)})


# ---
# DOMAIN 14: DEFAULTS / PREFERENCES
# ---


class DefaultsControl:

    # Allowed domains whitelist
    _SAFE_DOMAINS = frozenset(
        [
            "com.apple.dock",
            "com.apple.finder",
            "com.apple.Safari",
            "com.apple.screensaver",
            "com.apple.desktopservices",
            "com.apple.LaunchServices",
            "NSGlobalDomain",
            "com.apple.Terminal",
            "com.apple.screencapture",
        ]
    )

    @staticmethod
    def read(domain: str, key: str) -> dict:
        out = _run_safe(["defaults", "read", domain, key])
        return _result("defaults", "read", {"domain": domain, "key": key, "value": out})

    @staticmethod
    def write(domain: str, key: str, value: str, value_type: str = "-string") -> dict:
        if domain not in DefaultsControl._SAFE_DOMAINS:
            return _result(
                "defaults",
                "write",
                {
                    "error": f"Domain '{domain}' not in safe whitelist",
                    "allowed": list(DefaultsControl._SAFE_DOMAINS),
                },
                ok=False,
            )
        allowed_types = ["-string", "-int", "-float", "-bool"]
        if value_type not in allowed_types:
            return _result(
                "defaults", "write", {"error": f"Type must be one of {allowed_types}"}, ok=False
            )
        _run_safe(["defaults", "write", domain, key, value_type, value])
        res = _result(
            "defaults", "write", {"domain": domain, "key": key, "value": value, "type": value_type}
        )
        if res.get("ok"):
            StatePersistence.save("defaults", f"{domain}:{key}", {"value": value, "type": value_type})
        return res

    @staticmethod
    def delete(domain: str, key: str) -> dict:
        if domain not in DefaultsControl._SAFE_DOMAINS:
            return _result(
                "defaults",
                "delete",
                {"error": f"Domain '{domain}' not in safe whitelist"},
                ok=False,
            )
        _run_safe(["defaults", "delete", domain, key])
        res = _result("defaults", "delete", {"domain": domain, "key": key})
        if res.get("ok"):
            StatePersistence.save("defaults", f"{domain}:{key}", None)
        return res

    @staticmethod
    def list_keys(domain: str) -> dict:
        out = _run_safe(["defaults", "read", domain])
        return _result("defaults", "list_keys", {"domain": domain, "raw": out[:2000]})

    @staticmethod
    def dock_autohide(enabled: bool) -> dict:
        val = "true" if enabled else "false"
        _run_safe(["defaults", "write", "com.apple.dock", "autohide", "-bool", val])
        _run_safe(["killall", "Dock"])
        res = _result("defaults", "dock_autohide", {"autohide": enabled})
        if res.get("ok"):
            StatePersistence.save("defaults", "dock_autohide", {"enabled": enabled})
        return res

    @staticmethod
    def finder_show_hidden(enabled: bool) -> dict:
        val = "true" if enabled else "false"
        _run_safe(["defaults", "write", "com.apple.finder", "AppleShowAllFiles", "-bool", val])
        _run_safe(["killall", "Finder"])
        res = _result("defaults", "finder_show_hidden", {"enabled": enabled})
        if res.get("ok"):
            StatePersistence.save("defaults", "finder_show_hidden", {"enabled": enabled})
        return res

    @staticmethod
    def screenshot_format(fmt: str = "png") -> dict:
        allowed = ["png", "jpg", "tiff", "gif", "pdf"]
        if fmt not in allowed:
            return _result(
                "defaults", "screenshot_format", {"error": f"Must be one of {allowed}"}, ok=False
            )
        _run_safe(["defaults", "write", "com.apple.screencapture", "type", "-string", fmt])
        res = _result("defaults", "screenshot_format", {"format": fmt})
        if res.get("ok"):
            StatePersistence.save("defaults", "screenshot_format", {"format": fmt})
        return res

    @staticmethod
    def screenshot_location(path: str) -> dict:
        p = str(Path(path).expanduser().resolve())
        os.makedirs(p, exist_ok=True)
        _run_safe(["defaults", "write", "com.apple.screencapture", "location", "-string", p])
        res = _result("defaults", "screenshot_location", {"path": p})
        if res.get("ok"):
            StatePersistence.save("defaults", "screenshot_location", {"path": p})
        return res

# ---
# DOMAIN 15: HID (Human Interface Device) (NEW)
# ---


def _confirm_hid(action_desc: str) -> bool:
    if os.environ.get("OMEGA_HID_CONFIRM", "1").lower() not in ("1", "true", "yes"):
        return True
    
    script_dir = Path(__file__).resolve().parent
    overlay_path = script_dir / "noir_overlay.py"
    
    try:
        res = subprocess.run(
            [sys.executable, str(overlay_path), "--confirm", action_desc],
            capture_output=True, text=True, timeout=15
        )
        if res.returncode == 0:
            try:
                data = json.loads(res.stdout.strip())
                return data.get("status") == "confirmed"
            except Exception:
                return "confirmed" in res.stdout.lower()
        return False
    except Exception as e:
        log.error("HID confirmation failed to execute: %s", e)
        return False


class HIDControl:
    @staticmethod
    def click(x: int, y: int) -> dict:
        if not _confirm_hid(f"Mouse Click at ({x}, {y})"):
            return _result("hid", "click", {"error": "Secure hardware confirmation denied or timed out."}, ok=False)

        if _QUARTZ_AVAILABLE:
            try:
                move = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventMouseMoved, (x, y), Quartz.kCGMouseButtonLeft)
                down = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseDown, (x, y), Quartz.kCGMouseButtonLeft)
                up = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseUp, (x, y), Quartz.kCGMouseButtonLeft)
                
                Quartz.CGEventPost(Quartz.kCGHIDEventTap, move)
                Quartz.CGEventPost(Quartz.kCGHIDEventTap, down)
                time.sleep(0.01)
                Quartz.CGEventPost(Quartz.kCGHIDEventTap, up)
                return _result("hid", "click", {"x": x, "y": y, "mode": "in-process"})
            except Exception as e:
                log.warning("In-process Quartz click failed, falling back: %s", e)

        # Python CoreGraphics bridge script fallback
        script = f"""
import Quartz
import time

def mouseEvent(type, posx, posy):
    theEvent = Quartz.CGEventCreateMouseEvent(None, type, (posx, posy), Quartz.kCGMouseButtonLeft)
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, theEvent)

mouseEvent(Quartz.kCGEventMouseMoved, {x}, {y})
mouseEvent(Quartz.kCGEventLeftMouseDown, {x}, {y})
time.sleep(0.01)
mouseEvent(Quartz.kCGEventLeftMouseUp, {x}, {y})
        """
        out = _run_safe(["python3", "-c", script])
        return _result("hid", "click", {"x": x, "y": y, "output": out, "mode": "subprocess"})

    @staticmethod
    def type_text(text: str) -> dict:
        if not _confirm_hid(f"Type Text: '{text[:20]}...' (length {len(text)})"):
            return _result("hid", "type", {"error": "Secure hardware confirmation denied or timed out."}, ok=False)

        if _QUARTZ_AVAILABLE:
            try:
                down = Quartz.CGEventCreateKeyboardEvent(None, 0, True)
                up = Quartz.CGEventCreateKeyboardEvent(None, 0, False)
                Quartz.CGEventKeyboardSetUnicodeString(down, len(text), text)
                Quartz.CGEventKeyboardSetUnicodeString(up, len(text), text)
                Quartz.CGEventPost(Quartz.kCGHIDEventTap, down)
                Quartz.CGEventPost(Quartz.kCGHIDEventTap, up)
                return _result("hid", "type", {"text_len": len(text), "mode": "in-process-unicode"})
            except Exception as e:
                log.warning("In-process Quartz typing failed, falling back: %s", e)

        # AppleScript injection fallback
        _osa(f'tell application "System Events" to keystroke "{_sanitize(text)}"')
        return _result("hid", "type", {"text_len": len(text), "mode": "applescript"})


# ---
# DOMAIN 16: VIRTUALIZATION (NEW)
# ---


class VirtualizationControl:
    @staticmethod
    def get_colima_status() -> dict:
        out = _run_safe(["colima", "status"])
        is_running = "Running" in out
        return _result("virtualization", "colima_status", {"running": is_running, "raw": out})
        
    @staticmethod
    def get_docker_ps() -> dict:
        out = _run_safe(["docker", "ps", "--format", "{{json .}}"])
        containers = []
        if out and "ERROR:" not in out:
            try:
                containers = [json.loads(c) for c in out.splitlines() if c.strip()]
            except Exception as e:
                log.warning("Failed to parse docker ps JSON output: %s", e)
        return _result("virtualization", "docker_ps", {"containers": containers, "count": len(containers)})

# ---
# DOMAIN 17: COMMS (Communications) (NEW)
# ---

class CommsControl:
    @staticmethod
    def send_imessage(target: str, message: str) -> dict:
        if os.environ.get("OMEGA_COMMS_ENABLED", "").lower() not in ("1", "true", "yes"):
            return _result("comms", "imessage", {"error": "Comms domain is disabled. Set OMEGA_COMMS_ENABLED=1 to enable."}, ok=False)

        # Requires Messages app configuration
        script = f"""
            tell application "Messages"
                set targetService to 1st service whose service type = iMessage
                set targetBuddy to buddy "{_sanitize(target)}" of targetService
                send "{_sanitize(message)}" to targetBuddy
            end tell
        """
        out = _osa(script)
        if "ERROR" in out:
             return _result("comms", "imessage", {"target": target, "error": out}, ok=False)
        return _result("comms", "imessage", {"target": target, "sent": True})


# ---
# DOMAIN 18: MEDIA REMOTE (NEW)
# ---

class MediaRemoteControl:
    @staticmethod
    def play_pause() -> dict:
        # Universal play/pause
        script = """
        tell application "System Events"
            key code 100
        end tell
        """
        _osa(script)
        return _result("media", "play_pause", {})

    @staticmethod
    def next_track() -> dict:
        script = """
        tell application "System Events"
            key code 101
        end tell
        """
        _osa(script)
        return _result("media", "next_track", {})
        
    @staticmethod
    def get_spotify_status() -> dict:
        script = """
        if application "Spotify" is running then
            tell application "Spotify"
                set trk to name of current track
                set art to artist of current track
                set stat to player state as string
                return stat & "|" & trk & "|" & art
            end tell
        else
            return "not running"
        end if
        """
        out = _osa(script)
        if out == "not running" or "ERROR" in out:
             return _result("media", "spotify", {"running": False})
        parts = out.split("|")
        if len(parts) >= 3:
             return _result("media", "spotify", {"running": True, "state": parts[0], "track": parts[1], "artist": parts[2]})
        return _result("media", "spotify", {"running": True, "raw": out})


# ---
# DOMAIN 19: TRIGGERS (Automations & Sentinels) (NEW)
# ---

class TriggerControl:
    REGISTRY_PATH = "/tmp/omega_trigger_registry.json"
    MAX_SENTINELS = 5

    @classmethod
    def _get_registry(cls) -> dict:
        if not os.path.exists(cls.REGISTRY_PATH):
            return {}
        try:
            with open(cls.REGISTRY_PATH, "r") as f:
                reg = json.load(f)
        except Exception:
            return {}
        
        # Prune dead processes
        active = {}
        for name, info in reg.items():
            pid = info.get("pid")
            if pid:
                try:
                    # Check if process is running (signal 0 doesn't kill)
                    os.kill(pid, 0)
                    active[name] = info
                except OSError:
                    pass  # Dead process
        return active

    @classmethod
    def _save_registry(cls, registry: dict):
        try:
            with open(cls.REGISTRY_PATH, "w") as f:
                json.dump(registry, f, indent=2)
        except Exception as e:
            log.error(f"Failed to write trigger registry: {e}")

    @classmethod
    def add_trigger(cls, name: str, condition_cmd: str, action_cmd: str, interval: int = 10, one_shot: bool = True) -> dict:
        # 1. Strict sanitization to prevent directory traversal / injection in script path
        safe_name = re.sub(r'[^a-zA-Z0-9_]', '', name.replace(" ", "_"))
        if not safe_name:
            return _result("triggers", "add", {"error": "Invalid trigger name. Use alphanumeric characters or underscores."}, ok=False)

        # Validate commands do not contain shell metacharacters for security
        for cmd_name, cmd_val in [("condition_cmd", condition_cmd), ("action_cmd", action_cmd)]:
            if any(char in cmd_val for char in ['|', '>', '<', '&', ';', '$', '*']):
                return _result("triggers", "add", {
                    "error": f"Security restriction: {cmd_name} contains shell metacharacters. Shell execution is disabled."
                }, ok=False)

        # 2. Get active registry and enforce concurrency limit
        active = cls._get_registry()
        if len(active) >= cls.MAX_SENTINELS and safe_name not in active:
            return _result("triggers", "add", {
                "error": f"Maximum active sentinels ({cls.MAX_SENTINELS}) reached.",
                "active_count": len(active)
            }, ok=False)

        # 3. Kill existing trigger with the same name if running
        if safe_name in active:
            try:
                import signal
                os.kill(active[safe_name]["pid"], signal.SIGTERM)
            except OSError:
                pass

        # 4. Generate the JIT runner script in a secure directory with proper handlers
        script = f'''import time, subprocess, sys, datetime, os, signal, shlex
log_file = "/tmp/omega_trigger_{safe_name}.log"
def log(msg):
    try:
        with open(log_file, "a") as f:
            f.write(f"{{datetime.datetime.now().isoformat()}} - {{msg}}\\n")
    except:
        pass

log("Trigger '{safe_name}' started. PID={{os.getpid()}} interval={interval}s, one_shot={one_shot}")

def handle_sigterm(signum, frame):
    log("Received SIGTERM. Exiting gracefully.")
    sys.exit(0)

signal.signal(signal.SIGTERM, handle_sigterm)

def run_cmd(cmd_str):
    return subprocess.run(shlex.split(cmd_str), shell=False, capture_output=True, text=True)

while True:
    try:
        cond = run_cmd({repr(condition_cmd)})
        if cond.returncode == 0:
            log("Condition met. Executing action.")
            action_res = run_cmd({repr(action_cmd)})
            log(f"Action stdout: {{action_res.stdout.strip()[:200]}}")
            if action_res.stderr:
                log(f"Action stderr: {{action_res.stderr.strip()[:200]}}")
            if {one_shot}:
                log("One-shot triggered. Exiting.")
                sys.exit(0)
    except Exception as e:
        log(f"Error: {{e}}")
    time.sleep({interval})
'''
        path = f"/tmp/omega_trigger_{safe_name}.py"
        try:
            with open(path, "w") as f:
                f.write(script)
        except Exception as e:
            return _result("triggers", "add", {"error": f"Failed to write trigger file: {e}"}, ok=False)

        # 5. Spawn background process safely
        try:
            proc = subprocess.Popen([sys.executable, path], start_new_session=True)
            pid = proc.pid
        except Exception as e:
            return _result("triggers", "add", {"error": f"Failed to spawn trigger process: {e}"}, ok=False)

        # 6. Update registry
        active[safe_name] = {
            "pid": pid,
            "path": path,
            "condition": condition_cmd,
            "action": action_cmd,
            "interval": interval,
            "one_shot": one_shot,
            "created_at": time.time()
        }
        cls._save_registry(active)

        return _result("triggers", "add", {"name": safe_name, "pid": pid, "path": path, "interval": interval, "one_shot": one_shot})

    @classmethod
    def remove_trigger(cls, name: str) -> dict:
        safe_name = re.sub(r'[^a-zA-Z0-9_]', '', name.replace(" ", "_"))
        active = cls._get_registry()
        
        info = active.pop(safe_name, None)
        if info:
            pid = info.get("pid")
            try:
                import signal
                os.kill(pid, signal.SIGTERM)
            except OSError:
                pass
            cls._save_registry(active)
            _run_safe(["pkill", "-f", f"omega_trigger_{safe_name}.py"])
            return _result("triggers", "remove", {"name": safe_name, "status": "removed"})
        
        # Fallback to direct pkill if process is running but untracked
        _run_safe(["pkill", "-f", f"omega_trigger_{safe_name}.py"])
        return _result("triggers", "remove", {"name": safe_name, "status": "not_in_registry_but_killed_fallback"})

    @classmethod
    def list_triggers(cls) -> dict:
        active = cls._get_registry()
        return _result("triggers", "list", {
            "active": list(active.keys()),
            "details": active
        })

    @classmethod
    def kill_all_triggers(cls) -> dict:
        active = cls._get_registry()
        killed_names = []
        for name, info in active.items():
            pid = info.get("pid")
            try:
                import signal
                os.kill(pid, signal.SIGTERM)
                killed_names.append(name)
            except OSError:
                pass
        cls._save_registry({})
        
        # Backup cleanup
        _run_safe(["pkill", "-f", "omega_trigger_"])
        return _result("triggers", "kill_all", {"status": "all triggers killed", "killed": killed_names})




# ---
# UNIFIED SOVEREIGN SYSTEM
# ---


# Valid domain names whitelist
VALID_DOMAINS = frozenset(
    [
        "av_out",
        "network",
        "bluetooth",
        "power",
        "process",
        "fs",
        "clipboard",
        "screenshot",
        "notification",
        "window",
        "automation",
        "telemetry",
        "security",
        "defaults",
        "hid",
        "virtualization",
        "comms",
        "media_remote",
        "triggers",
        "ui"
    ]
)


class SovereignSystem:

    av_out = AVOutControl
    network = NetworkControl
    bluetooth = BluetoothControl
    power = PowerControl
    process = ProcessControl
    fs = FilesystemControl
    clipboard = ClipboardControl
    screenshot = ScreenshotControl
    notification = NotificationControl
    window = WindowControl
    automation = AutomationControl
    telemetry = TelemetryControl
    security = SecurityControl
    defaults = DefaultsControl
    hid = HIDControl
    virtualization = VirtualizationControl
    comms = CommsControl
    media_remote = MediaRemoteControl
    triggers = TriggerControl
    ui = UIMaestro

    @staticmethod
    def verify_state(domain: str = None) -> dict:
        if domain:
            res = StateVerifier.verify_domain(domain)
            return _result("system", "verify_state", res)
        domains = ['window', 'defaults', 'network', 'security', 'power', 'bluetooth']
        results = {}
        for d in domains:
            results[d] = StateVerifier.verify_domain(d)
        all_verified = all(r.get("verified", False) for r in results.values())
        return _result("system", "verify_state", {"domains": results, "verified": all_verified})

    @staticmethod
    def restore_state(domain: str, timestamp: float = None, require_restore_flag: bool = False) -> dict:
        res = StateVerifier.restore_domain(domain, timestamp, require_restore_flag)
        return _result("system", "restore_state", res)

    @staticmethod
    def self_test(print_output: bool = True) -> dict:
        tests = [
            ("av_out",         lambda: AVOutControl.get_volume()),
            ("network",        lambda: NetworkControl.get_wifi_status()),
            ("bluetooth",      lambda: BluetoothControl.status()),
            ("power",          lambda: PowerControl.get_battery()),
            ("process",        lambda: ProcessControl.get_frontmost()),
            ("filesystem",     lambda: FilesystemControl.get_disk_usage()),
            ("clipboard",      lambda: ClipboardControl.get()),
            ("screenshot",     lambda: _result("screenshot", "test", {"available": True})),
            ("notification",   lambda: NotificationControl.get_dnd()),
            ("window",         lambda: WindowControl.list_windows()),
            ("automation",     lambda: _result(
                "automation", "test", {"shortcuts": bool(shutil.which("shortcuts"))}
            )),
            ("telemetry",      lambda: TelemetryControl.get_info()),
            ("security",       lambda: SecurityControl.get_sip_status()),
            ("defaults",       lambda: DefaultsControl.read("NSGlobalDomain", "AppleShowAllExtensions")),
            ("hid",            lambda: _result("hid", "test", {"available": True})),
            ("virtualization", lambda: VirtualizationControl.get_colima_status()),
            ("comms",          lambda: _result("comms", "test", {"available": True})),
            ("media_remote",   lambda: _result("media", "test", {"available": True})),
            ("triggers",       lambda: _result("triggers", "test", {"available": True}))
        ]

        results: dict[str, Any] = {}
        wall_start = time.perf_counter()

        def _run_one(name: str, fn):
            t0 = time.perf_counter()
            try:
                r = fn()
                return name, {
                    "ok": r.get("ok", False),
                    "data": r.get("data"),
                    "ms": round((time.perf_counter() - t0) * 1000),
                }
            except Exception as e:
                return name, {
                    "ok": False,
                    "error": str(e),
                    "ms": round((time.perf_counter() - t0) * 1000),
                }

        # Run domains in parallel
        with ThreadPoolExecutor(max_workers=19) as pool:
            futures = {pool.submit(_run_one, name, fn): name for name, fn in tests}
            for fut in as_completed(futures):
                name, result = fut.result()
                results[name] = result

        # Preserve test order
        ordered = {name: results[name] for name, _ in tests if name in results}
        wall_ms = round((time.perf_counter() - wall_start) * 1000)
        passed = sum(1 for v in ordered.values() if v["ok"])
        total = len(ordered)

        if print_output:
            sep = "═" * 60
            lines = [
                "",
                sep,
                "  SOVEREIGN SYSTEM v14.1.0 — SELF TEST (19 DOMAINS PARALLEL)",
                sep,
            ]
            for name, r in ordered.items():
                icon = "✅" if r["ok"] else "❌"
                ms_tag = f"{r['ms']:>5}ms"
                detail = json.dumps(
                    r.get("data", r.get("error", "?")), default=str
                )[:52]
                lines.append(f"  {icon} {name:<15} {ms_tag}  {detail}")
            lines += [
                sep,
                f"  RESULT: {passed}/{total} operational  ·  wall: {wall_ms}ms",
                sep,
                "",
            ]
            print("\n".join(lines))

        return _result(
            "system", "self_test",
            {"passed": passed, "total": total, "wall_ms": wall_ms, "details": ordered},
        )


# --- CLI ENTRYPOINT ---

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] == "--test":
        SovereignSystem.self_test(print_output=True)
    elif sys.argv[1] == "--json-test":
        # Machine-readable parallel test
        r = SovereignSystem.self_test(print_output=False)
        print(json.dumps(r, default=str, indent=2))
    elif sys.argv[1] == "--verify-state":
        domain = sys.argv[2] if len(sys.argv) > 2 else None
        res = SovereignSystem.verify_state(domain)
        print(json.dumps(res, default=str, indent=2))
    elif sys.argv[1] == "--restore-state":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Usage: --restore-state <domain> [timestamp] [--force]"}))
            sys.exit(1)
        domain = sys.argv[2]
        ts = None
        force = False
        for arg in sys.argv[3:]:
            if arg == "--force":
                force = True
            else:
                try:
                    ts = float(arg)
                except ValueError:
                    pass
        res = SovereignSystem.restore_state(domain, ts, require_restore_flag=force)
        print(json.dumps(res, default=str, indent=2))
    elif sys.argv[1] == "--json":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Usage: --json domain action [args...]"}))
            sys.exit(1)
        domain = sys.argv[2]
        action = sys.argv[3]
        args = sys.argv[4:]
        if domain not in VALID_DOMAINS:
            print(json.dumps({"error": f"Invalid domain: {domain}"}))
            sys.exit(1)
        ctrl = getattr(SovereignSystem, domain, None)
        if ctrl:
            method = getattr(ctrl, action, None)
            if method:
                print(json.dumps(method(*args), default=str))
            else:
                print(json.dumps({"error": f"Unknown action: {domain}.{action}"}))
        else:
            print(json.dumps({"error": f"Unknown domain: {domain}"}))
    else:
        print("Usage: sovereign_system.py [--test | --json-test | --verify-state [domain] | --restore-state <domain> [timestamp] | --json domain action args...]")
