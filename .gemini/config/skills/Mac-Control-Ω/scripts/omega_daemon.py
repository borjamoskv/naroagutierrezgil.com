#!/usr/bin/env python3
# C7-REAL
"""
MAC-CONTROL-OMEGA v16.0.0 (C7 Adaptive CostScheduler IR Engine)
Auth: Bearer. Net: Localhost. WS: Thread-safe.
Ledger: execution_ledger.py. Scheduler: cost_scheduler.py.
"""
import asyncio
import logging
import os
import secrets
import time
from typing import Any

# Safe import for psutil (optional dependency)
try:
    import psutil
except ImportError:
    psutil = None  # Fallback if psutil is unavailable

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Request,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from mac_control_omega import Engine, Task, TaskKind
from cdp_backend import CDPBackend
from ax_backend import AXBackend
from hitl_queue import HITLQueue, ManualGateBackend
import execution_ledger as ledger
import cost_scheduler

log = logging.getLogger("omega_daemon")
START_TIME = time.time()

# ── Auth ──────────────────────────────────────────────────────────
_TOKEN_FILE = "/tmp/omega_daemon.token"

def _resolve_token() -> str:
    env = os.environ.get("OMEGA_DAEMON_TOKEN")
    if env: return env
    if os.path.exists(_TOKEN_FILE):
        with open(_TOKEN_FILE) as f:
            return f.read().strip()
    tok = secrets.token_hex(16)
    with open(_TOKEN_FILE, "w") as f:
        f.write(tok)
    os.chmod(_TOKEN_FILE, 0o600)
    return tok

DAEMON_TOKEN = _resolve_token()

def verify_token(request: Request):
    auth = request.headers.get("Authorization", "")
    if auth != f"Bearer {DAEMON_TOKEN}":
        raise HTTPException(status_code=401, detail="Invalid or missing token")

# ── App & Engine ──────────────────────────────────────────────────
app = FastAPI(title="MAC-CONTROL-OMEGA", version="16.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

hitl = HITLQueue()
hitl_backend = ManualGateBackend(hitl)
cdp_backend = CDPBackend()
ax_backend = AXBackend()

engine = Engine(
    backends={"cdp": cdp_backend, "ax": ax_backend, "hitl": hitl_backend},
    hitl_fallback=hitl_backend,
)

class TaskIn(BaseModel):
    kind: TaskKind
    payload: dict[str, Any] = Field(default_factory=dict)

class ResolveIn(BaseModel):
    task_id: str
    result: dict[str, Any]

# ── Endpoints ─────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"status": "OMEGA_DAEMON_ACTIVE", "version": "16.0.0", "league": "C7"}

@app.get("/api/v1/health")
def health():
    # Graceful fallback if psutil is unavailable
    cpu = psutil.cpu_percent() if psutil else 0
    ram = psutil.virtual_memory().percent if psutil else 0
    return {
        "status": "ok",
        "league": "C7",
        "uptime_s": round(time.time() - START_TIME, 1),
        "ws_clients": len(ws_clients),
        "cpu": cpu,
        "ram": ram,
        "backends": {
            "cdp": cdp_backend.health().available,
            "ax": ax_backend.health().available,
        },
    }

@app.post("/tasks", dependencies=[Depends(verify_token)])
async def submit_task(body: TaskIn):
    task = Task(id=f"task_{time.time()}", kind=body.kind, payload=body.payload)
    try:
        result = await engine.run(task)
        return {"ok": True, "task_id": task.id, "result": result, "status": task.status}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# ── HITL Endpoints ────────────────────────────────────────────────

@app.get("/hitl/pending", dependencies=[Depends(verify_token)])
def pending():
    return {"items": hitl.pending()}

@app.post("/hitl/resolve", dependencies=[Depends(verify_token)])
def resolve(body: ResolveIn):
    hitl.resolve(body.task_id, body.result)
    return {"ok": True, "task_id": body.task_id}

# ── Telemetry & Stats ─────────────────────────────────────────────

@app.get("/api/v1/stats", dependencies=[Depends(verify_token)])
def stats():
    """Execution ledger aggregate stats — feeds operator introspection."""
    return {
        "global": ledger.global_stats(),
    }

@app.get("/api/v1/stats/{domain}", dependencies=[Depends(verify_token)])
def domain_stats(domain: str):
    """Per-domain execution stats — domain-specific memory."""
    return {
        "domain": domain,
        "stats": ledger.domain_stats(domain),
        "cost_breakdown": cost_scheduler.explain(domain),
    }

@app.get("/api/v1/explain/{domain}")
def explain_scheduling(domain: str):
    """
    Debug endpoint: full Bayesian cost breakdown for a domain.
    Shows expected chain cost, historical failure rates, and which
    backend would win the auction right now.
    """
    breakdown = cost_scheduler.explain(domain)
    winner = cost_scheduler.select_backend(domain)
    return {
        "domain": domain,
        "winner": winner.name,
        "breakdown": breakdown,
    }

# ── WebSocket (telemetry) ─────────────────────────────────────────

ws_clients: set = set()
ws_lock = asyncio.Lock()

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    token = websocket.query_params.get("token", "")
    if token != DAEMON_TOKEN:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await websocket.accept()
    async with ws_lock:
        ws_clients.add(websocket)
    try:
        while True:
            cpu = psutil.cpu_percent() if psutil else 0
            ram = psutil.virtual_memory().percent if psutil else 0
            data = {
                "cpu": cpu,
                "ram": ram,
                "ts": time.time(),
            }
            await websocket.send_json(data)
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
    finally:
        async with ws_lock:
            ws_clients.discard(websocket)

# ── Entrypoint ────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    import socket
    host = os.environ.get("OMEGA_BIND_HOST", "127.0.0.1")
    port = int(os.environ.get("OMEGA_BIND_PORT", "8011"))
    print("OMEGA DAEMON v16.0.0 (C7 Adaptive CostScheduler)")
    print(f"Host: {host}:{port}")
    print(f"Token: {DAEMON_TOKEN}")
    # Check if port is already bound and attempt graceful cleanup if possible
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        s.bind((host, port))
    except OSError:
        print("Port already in use. Attempting to free existing daemon instance.")
        if psutil:
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    cmd = ' '.join(proc.info['cmdline'])
                    if 'omega_daemon' in cmd or 'uvicorn' in cmd:
                        if f"{host}:{port}" in cmd:
                            proc.terminate()
                except (psutil.NoSuchProcess, psutil.AccessDenied, TypeError):
                    continue
        else:
            print("psutil unavailable; cannot auto‑cleanup conflicting process.")
    finally:
        s.close()
    reload_enabled = os.environ.get("OMEGA_RELOAD", "").lower() in {"1", "true", "yes"}
    uvicorn.run("omega_daemon:app", host=host, port=port, reload=reload_enabled)
