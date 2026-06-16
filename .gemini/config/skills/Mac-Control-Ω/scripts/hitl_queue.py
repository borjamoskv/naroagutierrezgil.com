"""
hitl_queue.py — C7-REAL HITL Queue with Context-Aware Persistence

Bridges the Backend Protocol with the new hitl_store.py (context snapshots).
"""
from __future__ import annotations

import asyncio
import os
import time
from typing import Any

from mac_control_omega import Task, BackendHealth, ExecutionCost, TaskKind
import hitl_store


class HITLQueue:
    """
    Human-in-the-loop queue backed by hitl_store.py (SQLite with context snapshots).
    Async event-based: submit() freezes the intent, wait() blocks until release().
    """

    def __init__(self) -> None:
        self._events: dict[str, asyncio.Event] = {}
        self._results: dict[str, dict[str, Any]] = {}
        self._row_map: dict[str, int] = {}  # task_id → hitl_queue row_id

    def submit(self, task: Task, driver=None) -> int:
        """Freeze task into SQLite with ambient context snapshot."""
        row_id = hitl_store.enqueue(
            payload={"task_id": task.id, "kind": task.kind.value, "payload": task.payload},
            driver=driver,
        )
        self._row_map[task.id] = row_id

        if task.id not in self._events:
            self._events[task.id] = asyncio.Event()

        return row_id

    async def wait(self, task_id: str, timeout_s: int = 900) -> dict[str, Any]:
        """Block until operator resolves the frozen intent."""
        if task_id not in self._events:
            self._events[task_id] = asyncio.Event()

        try:
            await asyncio.wait_for(self._events[task_id].wait(), timeout=timeout_s)
        except asyncio.TimeoutError as exc:
            raise TimeoutError(f"HITL timeout for task {task_id}") from exc

        return self._results.pop(task_id, {})

    def resolve(self, task_id: str, result: dict[str, Any]) -> None:
        """Operator provides resolution. Unblocks the waiting coroutine."""
        # Release from SQLite
        row_id = self._row_map.get(task_id)
        if row_id:
            try:
                hitl_store.release(row_id)
            except ValueError:
                pass  # already resolved or expired

        self._results[task_id] = result
        event = self._events.get(task_id)
        if event:
            event.set()
            self._events.pop(task_id, None)
        self._row_map.pop(task_id, None)

    def pending(self) -> list[dict]:
        """Return all pending HITL tasks with context snapshots."""
        return hitl_store.pending_tasks()


class ManualGateBackend:
    """Backend Protocol implementation for HITL."""
    name = "hitl"

    def __init__(self, hitl: HITLQueue) -> None:
        self.hitl = hitl

    def health(self) -> BackendHealth:
        return BackendHealth(available=True, reason="manual gate always available")

    def evaluate_cost(self, task: Task) -> ExecutionCost:
        if task.kind == TaskKind.MANUAL_GATE:
            return ExecutionCost(latency_penalty=0, fragility_score=0, human_friction=0)
        return ExecutionCost(latency_penalty=0, fragility_score=0, human_friction=1000)

    async def execute(self, task: Task) -> dict[str, Any]:
        row_id = self.hitl.submit(task)
        timeout_s = int(os.getenv("HITL_TIMEOUT_S", "900"))
        result = await self.hitl.wait(task.id, timeout_s=timeout_s)
        return {
            "backend": self.name,
            "task_id": task.id,
            "hitl_row_id": row_id,
            "status": "resolved",
            "detail": result,
        }
