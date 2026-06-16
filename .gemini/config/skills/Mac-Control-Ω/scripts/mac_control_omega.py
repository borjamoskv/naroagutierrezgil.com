from __future__ import annotations

import asyncio
import enum
import time
from dataclasses import dataclass, field
from typing import Any, Protocol


class TaskKind(str, enum.Enum):
    WEB_FLOW = "web_flow"
    NATIVE_OS = "native_os"
    MANUAL_GATE = "manual_gate"


@dataclass(slots=True)
class Task:
    id: str
    kind: TaskKind
    payload: dict[str, Any] = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)
    attempts: int = 0
    status: str = "queued"
    error: str | None = None


@dataclass(slots=True)
class BackendHealth:
    available: bool
    reason: str = ""


@dataclass(slots=True)
class ExecutionCost:
    latency_penalty: float
    fragility_score: float
    human_friction: float

    @property
    def total_cost(self) -> float:
        return self.latency_penalty + self.fragility_score + self.human_friction


class Backend(Protocol):
    name: str

    def health(self) -> BackendHealth: ...
    def evaluate_cost(self, task: Task) -> ExecutionCost: ...
    async def execute(self, task: Task) -> dict[str, Any]: ...


def _extract_domain(task: Task) -> str:
    """Extract domain/target identifier from task payload for ledger tracking."""
    p = task.payload
    return p.get("domain", p.get("url", p.get("app", "")))


def trigger_physical_feedback(event_type: str):
    import subprocess
    import sys
    import os
    from pathlib import Path

    if os.environ.get("OMEGA_PHYSICAL_FEEDBACK", "1").lower() not in ("1", "true", "yes"):
        return

    script_dir = Path(__file__).resolve().parent

    try:
        if event_type == "started":
            beacon_path = script_dir / "notch_beacon.py"
            subprocess.Popen([sys.executable, str(beacon_path), "--duration", "0.05"])
        elif event_type == "success":
            halo_path = script_dir / "notch_halo.py"
            subprocess.Popen([sys.executable, str(halo_path), "--profile", "industrial", "--duration", "1.0", "--no-led"])
        elif event_type == "failed":
            halo_path = script_dir / "notch_halo.py"
            subprocess.Popen([sys.executable, str(halo_path), "--profile", "void", "--duration", "2.0"])
        elif event_type == "hitl_pending":
            halo_path = script_dir / "notch_halo.py"
            subprocess.Popen([sys.executable, str(halo_path), "--profile", "ghost", "--duration", "3.0"])
    except Exception:
        pass


class Engine:
    """
    C7-REAL Execution Engine.

    Delegates scheduling decisions to cost_scheduler.select_backend()
    (Bayesian expected-cost model) and records every execution to
    execution_ledger for adaptive coefficient learning.
    """

    def __init__(self, backends: dict[str, Backend], hitl_fallback: Backend) -> None:
        self.backends = backends  # name → Backend instance
        self.hitl_fallback = hitl_fallback

    def _resolve_backend(self, profile_name: str) -> Backend:
        """Map cost_scheduler profile name to actual Backend instance."""
        return self.backends.get(profile_name, self.hitl_fallback)

    async def run(self, task: Task) -> dict[str, Any]:
        import cost_scheduler
        import execution_ledger as ledger

        domain = _extract_domain(task)

        # Bayesian scheduling decision
        profile = cost_scheduler.select_backend(domain, task.kind.value)
        backend = self._resolve_backend(profile.name)
        cost = backend.evaluate_cost(task)

        task.attempts += 1
        task.status = f"running:{backend.name}"

        if backend.name == "hitl" or task.kind == TaskKind.MANUAL_GATE:
            trigger_physical_feedback("hitl_pending")
        else:
            trigger_physical_feedback("started")

        t0 = time.monotonic()
        try:
            result = await backend.execute(task)
            duration_ms = int((time.monotonic() - t0) * 1000)
            task.status = "done"

            ledger.record(
                intent_kind=task.kind.value, domain=domain,
                backend=backend.name, cost_eval=cost.total_cost,
                outcome="success", duration_ms=duration_ms,
            )
            trigger_physical_feedback("success")
            return result

        except Exception as exc:
            duration_ms = int((time.monotonic() - t0) * 1000)
            task.status = "failed"
            task.error = str(exc)

            # Classify error type for ledger
            error_type = type(exc).__name__
            ledger.record(
                intent_kind=task.kind.value, domain=domain,
                backend=backend.name, cost_eval=cost.total_cost,
                outcome="failure", duration_ms=duration_ms,
                error_type=error_type,
            )

            if backend.name != "hitl":
                trigger_physical_feedback("hitl_pending")
                fallback = self.hitl_fallback
                fallback_cost = fallback.evaluate_cost(task)
                task.status = f"running:{fallback.name}"

                t1 = time.monotonic()
                try:
                    result = await fallback.execute(task)
                    fb_dur = int((time.monotonic() - t1) * 1000)
                    ledger.record(
                        intent_kind=task.kind.value, domain=domain,
                        backend=fallback.name, cost_eval=fallback_cost.total_cost,
                        outcome="escalated", duration_ms=fb_dur,
                        error_type=f"escalated_from:{backend.name}",
                    )
                    return result
                except Exception as fb_exc:
                    fb_dur = int((time.monotonic() - t1) * 1000)
                    ledger.record(
                        intent_kind=task.kind.value, domain=domain,
                        backend=fallback.name, cost_eval=fallback_cost.total_cost,
                        outcome="failure", duration_ms=fb_dur,
                        error_type=type(fb_exc).__name__,
                    )
                    raise

            trigger_physical_feedback("failed")
            raise


class MacControlOmegaSkill:
    """
    Legacy shim for the Gemini skill runner to maintain compatibility
    if invoked without the FastAPI daemon.
    """

    def __init__(self) -> None:
        self.name = "mac-control-omega"
        self.description = "C7-REAL | Adaptive Execution IR Engine"
        self.instructions = "# C7-REAL Adaptive Hybrid Execution Engine active."

    def get_system_prompt(self) -> str:
        return self.instructions

    def execute(self, payload: dict) -> dict:
        from pathlib import Path
        import sys

        base_dir = Path(__file__).resolve().parent
        if str(base_dir) not in sys.path:
            sys.path.insert(0, str(base_dir))

        from cdp_backend import CDPBackend
        from ax_backend import AXBackend
        from hitl_queue import ManualGateBackend, HITLQueue

        hitl_q = HITLQueue()
        hitl_backend = ManualGateBackend(hitl_q)
        cdp = CDPBackend()
        ax = AXBackend()

        engine = Engine(
            backends={"cdp": cdp, "ax": ax, "hitl": hitl_backend},
            hitl_fallback=hitl_backend,
        )

        raw_kind = payload.get("kind", "native_os")
        try:
            kind = TaskKind(raw_kind)
        except ValueError:
            kind = TaskKind.NATIVE_OS

        task = Task(
            id=f"sync_{time.time_ns()}",
            kind=kind,
            payload=payload,
        )

        return asyncio.run(engine.run(task))
