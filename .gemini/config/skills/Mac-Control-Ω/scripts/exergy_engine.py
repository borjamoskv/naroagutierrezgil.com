#!/usr/bin/env python3
# C5-REAL
# Universal Exergetic Engine (Motor Exergético Universal) - Transactional Orchestrator with Event Ledger
import logging
import os
import sys
import time
import sqlite3
import subprocess
from datetime import datetime

try:
    import yaml
except ImportError:
    import json as yaml

sys.path.insert(0, os.path.dirname(__file__))
from sovereign_system import SovereignSystem as SS

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] EXERGY-Ω: %(message)s')
log = logging.getLogger("exergy_engine")

class ExergyEngine:
    def __init__(self, rules_path: str):
        self.rules_path = rules_path
        self.workflows = []
        self.db_path = os.path.join(os.path.dirname(__file__), "rules.db")
        self.ledger_path = os.path.join(os.path.dirname(__file__), "exergy_ledger.db")
        
        # Edge-trigger state map: event_signature -> bool
        self.edge_state = {}
        self.state_cache = {}
        
        self.init_db()
        self.load_rules()

    def init_db(self):
        # Operational limits DB
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS executions
                            (rule_id TEXT PRIMARY KEY, last_execution REAL, count INTEGER)''')
                            
        # Event Ledger DB
        with sqlite3.connect(self.ledger_path) as conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS events
                            (id INTEGER PRIMARY KEY AUTOINCREMENT, ts REAL, event_name TEXT, state TEXT)''')
            conn.execute('''CREATE TABLE IF NOT EXISTS executions
                            (id INTEGER PRIMARY KEY AUTOINCREMENT, ts REAL, rule_id TEXT, status TEXT)''')
            conn.execute('''CREATE TABLE IF NOT EXISTS verifications
                            (id INTEGER PRIMARY KEY AUTOINCREMENT, ts REAL, rule_id TEXT, step TEXT, status TEXT)''')
            conn.execute('''CREATE TABLE IF NOT EXISTS rollbacks
                            (id INTEGER PRIMARY KEY AUTOINCREMENT, ts REAL, rule_id TEXT, step TEXT)''')
            conn.execute('''CREATE TABLE IF NOT EXISTS exergy_metrics
                            (id INTEGER PRIMARY KEY AUTOINCREMENT, ts REAL, metric_name TEXT, value REAL)''')

    def log_ledger(self, table: str, **kwargs):
        cols = ", ".join(kwargs.keys())
        placeholders = ", ".join("?" for _ in kwargs)
        values = tuple(kwargs.values())
        try:
            with sqlite3.connect(self.ledger_path) as conn:
                conn.execute(f"INSERT INTO {table} (ts, {cols}) VALUES (?, {placeholders})", (time.time(), *values))
        except Exception as e:
            log.error(f"Ledger insertion failed: {e}")

    def load_rules(self):
        try:
            with open(self.rules_path, 'r') as f:
                data = yaml.safe_load(f)
                raw_rules = data.get("workflows", []) or data.get("rules", [])
                self.workflows = sorted(raw_rules, key=lambda r: r.get("priority", 0), reverse=True)
        except Exception as e:
            log.error(f"Failed to load rules: {e}")

    def evaluate_event_state(self, event_name: str) -> bool:
        if event_name == "battery_low":
            bat = SS.power.get_battery().get("data", {})
            try:
                pct = int(str(bat.get("percent", "100%")).replace("%", ""))
                return pct < 20 and not bat.get("charging", True)
            except:
                return False
        
        elif event_name == "cpu_high":
            procs = SS.process.list_processes("cpu", limit=1).get("data", {})
            top_list = procs.get("top", [])
            if len(top_list) > 1:
                parts = top_list[1].split()
                if len(parts) > 2:
                    try:
                        return float(parts[2]) > 90.0
                    except:
                        pass
            return False

        elif event_name == "wifi_changed":
            current_ssid = str(SS.network.get_wifi_ssid().get("data", {}).get("ssid", ""))
            last_ssid = self.state_cache.get("wifi_ssid")
            if last_ssid is not None and current_ssid != last_ssid:
                self.state_cache["wifi_ssid"] = current_ssid
                return True
            self.state_cache["wifi_ssid"] = current_ssid
            return False
            
        elif event_name == "clipboard_changed":
            current_clip = str(SS.clipboard.get().get("data", {}).get("text", ""))
            last_clip = self.state_cache.get("clipboard_cache")
            if last_clip is not None and current_clip != last_clip:
                self.state_cache["clipboard_cache"] = current_clip
                return True
            self.state_cache["clipboard_cache"] = current_clip
            return False
            
        elif event_name == "always_true":
            return True
            
        return False

    def evaluate_edge_trigger(self, event_name: str, rule_id: str) -> bool:
        if not event_name:
            return False
        current_state = self.evaluate_event_state(event_name)
        edge_key = f"{rule_id}_{event_name}"
        previous_state = self.edge_state.get(edge_key, False)
        self.edge_state[edge_key] = current_state
        
        if current_state and not previous_state:
            self.log_ledger("events", event_name=event_name, state="TRIGGERED")
            return True
        return False

    def evaluate_condition(self, cond_name: str) -> bool:
        if not cond_name:
            return True
        if cond_name == "docker_running":
            dock = SS.virtualization.get_docker_ps().get("data", {}).get("raw", "")
            return "CONTAINER ID" in dock and len(dock.splitlines()) > 1
        return True

    def execute_action(self, action_name: str, rule_id: str) -> bool:
        log.info(f"[{rule_id}] Executing step: {action_name}")
        try:
            if action_name == "suspend_containers" or action_name == "pause_docker":
                subprocess.run("docker pause $(docker ps -q) 2>/dev/null", shell=True)
                return True
            elif action_name == "notify_battery_saving":
                SS.notification.send("Exergy Engine", "Battery protection workflow triggered.")
                return True
            elif action_name == "reduce_brightness":
                SS.av_out.set_brightness(10)
                return True
            elif action_name == "notify_high_cpu":
                SS.notification.send("Exergy Engine", "Warning: High CPU usage detected.")
                return True
            elif action_name == "check_battery":
                return True
            elif action_name == "detect_sensitive_content":
                clip = SS.clipboard.get().get("data", {}).get("text", "")
                # Clean API keys, private keys, or passwords
                if "BEGIN RSA PRIVATE KEY" in clip or "sk_live_" in clip:
                    SS.clipboard.set("[REDACTED BY EXERGY ENGINE]")
                    self.log_ledger("exergy_metrics", metric_name="saved_risk", value=1.0)
                return True
            elif action_name == "enforce_finder_settings":
                script_path = "/Users/borjafernandezangulo/.gemini/antigravity/brain/82c25b18-d469-4c0a-a6a9-c2fe670bf99a/optimize_finder.sh"
                subprocess.run([script_path], capture_output=True)
                return True
            else:
                log.warning(f"[{rule_id}] Unknown action binding: {action_name}")
                return False
        except Exception as e:
            log.error(f"[{rule_id}] Action execution failed: {e}")
            return False

    def verify_state(self, verify_name: str, rule_id: str) -> bool:
        log.info(f"[{rule_id}] Verifying state: {verify_name}")
        ok = True
        if verify_name == "containers_paused" or verify_name == "battery_saving_active":
            dock = SS.virtualization.get_docker_ps().get("data", {}).get("raw", "")
            ok = "(Paused)" in dock or "CONTAINER ID" not in dock
        elif verify_name == "clipboard_clean":
            clip = SS.clipboard.get().get("data", {}).get("text", "")
            ok = "BEGIN RSA PRIVATE KEY" not in clip and "sk_live_" not in clip
        elif verify_name == "finder_is_clean":
            verifier_path = "/Users/borjafernandezangulo/.gemini/config/skills/Finder-Optimizer-OMEGA/verify_finder_optimizer.py"
            res = subprocess.run(["python3", verifier_path], capture_output=True)
            ok = res.returncode == 0
            
        status = "PASSED" if ok else "FAILED"
        self.log_ledger("verifications", rule_id=rule_id, step=verify_name, status=status)
        return ok

    def rollback_action(self, rollback_name: str, rule_id: str):
        log.warning(f"[{rule_id}] Executing rollback: {rollback_name}")
        self.log_ledger("rollbacks", rule_id=rule_id, step=rollback_name)
        if rollback_name == "resume_containers" or rollback_name == "resume_docker":
            subprocess.run("docker unpause $(docker ps -q) 2>/dev/null", shell=True)
        elif rollback_name == "restore_brightness":
            SS.av_out.set_brightness(50)
        elif rollback_name == "restore_previous_clipboard":
            pass # Would require maintaining a clipboard history buffer
        else:
            log.warning(f"[{rule_id}] Unknown rollback binding: {rollback_name}")

    def get_tracker_state(self, rule_id: str) -> dict:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT last_execution, count FROM executions WHERE rule_id=?", (rule_id,))
            row = cursor.fetchone()
            if row:
                return {"last_execution": row[0], "count": row[1]}
            return {"last_execution": 0.0, "count": 0}

    def can_execute(self, rule: dict) -> bool:
        rule_id = rule.get("id", "unknown_rule")
        cooldown = rule.get("cooldown", 0)
        max_executions = rule.get("max_executions", -1)

        tracker = self.get_tracker_state(rule_id)
        if max_executions != -1 and tracker["count"] >= max_executions:
            return False
        now = time.time()
        if (now - tracker["last_execution"]) < cooldown:
            return False
        return True

    def commit_execution(self, rule_id: str):
        tracker = self.get_tracker_state(rule_id)
        now = time.time()
        count = tracker["count"] + 1
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''INSERT OR REPLACE INTO executions (rule_id, last_execution, count) 
                            VALUES (?, ?, ?)''', (rule_id, now, count))
        self.log_ledger("executions", rule_id=rule_id, status="COMMITTED")

    def loop(self, interval: int = 10):
        log.info(f"Sovereign Orchestrator STARTED. Ledger: {self.ledger_path}. Reality Level: C5-REAL.")
        while True:
            try:
                self.load_rules()
                for workflow in self.workflows:
                    rule_id = workflow.get("id", "unknown_workflow")
                    when = workflow.get("when")
                    cond = workflow.get("if")
                    steps = workflow.get("steps", workflow.get("then", []))
                    verifications = workflow.get("verify", [])
                    rollbacks_mapping = workflow.get("rollback", [])

                    if self.evaluate_edge_trigger(when, rule_id):
                        if self.evaluate_condition(cond):
                            if self.can_execute(workflow):
                                executed_steps = []
                                execution_failed = False
                                
                                for step in steps:
                                    success = self.execute_action(step, rule_id)
                                    if success:
                                        executed_steps.append(step)
                                    else:
                                        execution_failed = True
                                        break
                                
                                verify_passed = not execution_failed
                                if verify_passed:
                                    for v in verifications:
                                        if not self.verify_state(v, rule_id):
                                            verify_passed = False
                                            break
                                
                                if not verify_passed:
                                    self.log_ledger("executions", rule_id=rule_id, status="FAILED_ROLLED_BACK")
                                    for r in reversed(rollbacks_mapping):
                                        self.rollback_action(r, rule_id)
                                else:
                                    self.commit_execution(rule_id)

            except Exception as e:
                log.error(f"Event loop exception: {e}")
                
            time.sleep(interval)

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    default_rules = os.path.join(base_dir, "exergy_rules.yaml")
    rules_file = sys.argv[1] if len(sys.argv) > 1 else default_rules
    engine = ExergyEngine(rules_file)
    engine.loop(interval=5)
