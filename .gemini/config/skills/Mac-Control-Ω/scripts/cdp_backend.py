from __future__ import annotations

import os
from typing import Any

from mac_control_omega import Task, BackendHealth, ExecutionCost


class CDPBackend:
    name = "cdp"

    def __init__(self) -> None:
        self.ws_endpoint = os.getenv("CDP_WS_ENDPOINT")

    def health(self) -> BackendHealth:
        ok = bool(self.ws_endpoint)
        reason = "ws endpoint configured" if ok else "missing CDP_WS_ENDPOINT"
        return BackendHealth(available=ok, reason=reason)

    def evaluate_cost(self, task: Task) -> ExecutionCost:
        # High fragility if the domain involves captchas
        is_cloudflare = task.payload.get("cloudflare_challenge", False)
        
        # If the task is not a WEB_FLOW, penalize heavily
        if task.kind != "web_flow":
            return ExecutionCost(latency_penalty=10, fragility_score=5000, human_friction=0)
            
        fragility = 500 if is_cloudflare else 10
        return ExecutionCost(latency_penalty=5, fragility_score=fragility, human_friction=0)

    async def execute(self, task: Task) -> dict[str, Any]:
        if not self.health().available:
            raise RuntimeError(self.health().reason)

        import json
        import urllib.request
        import websocket
        
        js = task.payload.get("js", "")
        if not js:
            return {"backend": self.name, "task_id": task.id, "status": "error", "error": "No JS payload"}

        try:
            ws = websocket.create_connection(self.ws_endpoint, suppress_origin=True)
            ws.send(json.dumps({"id": 1, "method": "Runtime.enable"}))
            ws.recv()
            ws.send(json.dumps({
                "id": 2, 
                "method": "Runtime.evaluate", 
                "params": {"expression": js, "returnByValue": True}
            }))
            
            while True:
                res_raw = ws.recv()
                res = json.loads(res_raw)
                if res.get("id") == 2:
                    return {
                        "backend": self.name,
                        "task_id": task.id,
                        "status": "ok",
                        "result": res.get("result", {}).get("result", {}).get("value", "")
                    }
        except Exception as e:
            raise RuntimeError(f"CDP Exception: {e}")
