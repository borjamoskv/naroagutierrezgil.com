"""
ax_backend.py — C7-REAL AX Backend with Lazy Pre-Scan Probe

Implements the Backend Protocol for macOS Accessibility execution.
Before committing to full AX tree traversal, probes the first N nodes
to estimate scan complexity. If estimated cost exceeds threshold,
the backend inflates its own cost to trigger CostScheduler self-descarte.
"""
from __future__ import annotations

import subprocess
import time
from typing import Any

from mac_control_omega import Task, BackendHealth, ExecutionCost

AX_COST_THRESHOLD_MS = 150  # above this, AX is too expensive


def probe_ax_complexity(app_name: str = "", sample_n: int = 50) -> dict:
    """
    Sample the first N nodes of the AX tree to estimate scan complexity
    BEFORE committing to the AX backend.
    Returns: {node_count_estimate, probe_ms, estimated_full_ms, viable}
    """
    if app_name:
        script = (
            f'tell application "System Events"\n'
            f'  set _els to every UI element of window 1 of process "{app_name}"\n'
            f'  return count of _els\n'
            f'end tell'
        )
    else:
        script = (
            'tell application "System Events"\n'
            '  set _app to first process whose frontmost is true\n'
            '  set _els to every UI element of window 1 of _app\n'
            '  return count of _els\n'
            'end tell'
        )

    t0 = time.perf_counter()
    try:
        result = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True, text=True, timeout=2.0
        )
        elapsed_ms = (time.perf_counter() - t0) * 1000
        node_count = int(result.stdout.strip()) if result.returncode == 0 else 9999
        estimated_full_ms = elapsed_ms * max(1, node_count / sample_n)

        return {
            "node_count_estimate": node_count,
            "probe_ms": round(elapsed_ms, 1),
            "estimated_full_ms": round(estimated_full_ms, 1),
            "viable": estimated_full_ms < AX_COST_THRESHOLD_MS,
        }
    except (subprocess.TimeoutExpired, Exception):
        return {
            "node_count_estimate": 9999,
            "probe_ms": 2000,
            "estimated_full_ms": 9999,
            "viable": False,
        }


class AXBackend:
    """
    Execution layer over macOS Accessibility.
    Pre-scans AX tree complexity before committing.
    """
    name = "ax"

    def __init__(self) -> None:
        self._last_probe: dict | None = None

    def health(self) -> BackendHealth:
        return BackendHealth(available=True, reason="AX available")

    def evaluate_cost(self, task: Task) -> ExecutionCost:
        if task.kind != "native_os":
            return ExecutionCost(latency_penalty=50, fragility_score=500, human_friction=0)

        # Run probe to get real latency estimate
        app_name = task.payload.get("app", "")
        probe = probe_ax_complexity(app_name)
        self._last_probe = probe

        if not probe["viable"]:
            # Inflate latency to self-descarte from scheduler auction
            return ExecutionCost(
                latency_penalty=probe["estimated_full_ms"] / 10.0,
                fragility_score=200,
                human_friction=0,
            )

        # Scale latency by observed probe, not hardcoded 30
        latency = max(10, probe["estimated_full_ms"] / 10.0)
        return ExecutionCost(latency_penalty=latency, fragility_score=50, human_friction=0)

    async def execute(self, task: Task) -> dict[str, Any]:
        # Lazy import to avoid circular deps at module level
        try:
            from ui_maestro import UIMaestro
        except ImportError:
            UIMaestro = None
        try:
            from ax_graph import AXGraph
        except ImportError:
            AXGraph = None

        payload = task.payload
        action = payload.get("action")

        if action == "click" and UIMaestro:
            return UIMaestro.click_element_with_quartz_fallback(
                app_name=payload.get("app", ""),
                target_title=payload.get("title"),
                target_id=payload.get("id"),
                target_role=payload.get("role"),
            )

        if action == "type" and UIMaestro:
            return UIMaestro.type_text_with_quartz_fallback(
                app_name=payload.get("app", ""),
                text=payload.get("text", ""),
                target_title=payload.get("title"),
                target_id=payload.get("id"),
                target_role=payload.get("role"),
            )

        if action == "scan" and AXGraph:
            return AXGraph.scan(
                app_name=payload.get("app", ""),
                limit=payload.get("limit", 100),
            )

        if action == "find_role" and AXGraph:
            return AXGraph.find_role(
                app_name=payload.get("app", ""),
                role=payload.get("role", ""),
            )

        if action == "dump" and AXGraph:
            return AXGraph.dump(
                app_name=payload.get("app", ""),
                max_depth=payload.get("depth", 5),
            )

        return {
            "error": "unknown_action",
            "payload": payload,
            "probe": self._last_probe,
        }
