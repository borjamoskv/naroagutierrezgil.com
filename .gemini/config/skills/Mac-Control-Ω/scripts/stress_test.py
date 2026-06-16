import asyncio
import json
import os
import sys

from mac_control_omega import Task, TaskKind, CostScheduler, Engine
from ax_backend import AXBackend
from cdp_backend import CDPBackend
from hitl_queue import HITLQueue, ManualGateBackend
from hitl_store import HITLStore

async def run_stress_test():
    print("==================================================")
    print("  C6 MAC-CONTROL-Ω : PROBABILISTIC STRESS TEST")
    print("==================================================\n")

    # Clear previous DB
    if os.path.exists("hitl.db"):
        os.remove("hitl.db")

    hitl_q = HITLQueue()
    hitl_backend = ManualGateBackend(hitl_q)
    cdp_backend = CDPBackend()
    ax_backend = AXBackend()

    scheduler = CostScheduler(
        backends=[cdp_backend, ax_backend, hitl_backend],
        hitl_fallback=hitl_backend
    )
    engine = Engine(scheduler)

    print("[!] TEST 1: Simple macOS Native Action")
    task1 = Task(id="t1", kind=TaskKind.NATIVE_OS, payload={"action": "scan", "app": "Finder"})
    chosen1 = scheduler.choose(task1)
    print(f"   -> Scheduler chose: {chosen1.name}")
    print(f"   -> Expecting: ax\n")

    print("[!] TEST 2: High-Fragility Web Flow (Cloudflare)")
    task2 = Task(id="t2", kind=TaskKind.WEB_FLOW, payload={"cloudflare_challenge": True, "js": "login()"})
    chosen2 = scheduler.choose(task2)
    print(f"   -> Scheduler chose: {chosen2.name}")
    print(f"   -> Expecting: hitl (CDP too fragile)\n")

    print("[!] TEST 3: Engine Execution & Backpressure")
    print("   -> Pushing task2 to engine...")
    # We use a quick timeout for HITL wait to not freeze the test
    os.environ["HITL_TIMEOUT_S"] = "1"
    
    try:
        res = await engine.run(task2)
        print(f"   -> Engine Result: {res}")
    except Exception as e:
        print(f"   -> Engine Execution yielded: {e}")

    print("\n[!] TEST 4: SQLite Persistence Check")
    store = HITLStore()
    pending = store.load_pending()
    print(f"   -> Pending tasks in hitl.db: {len(pending)}")
    for row in pending:
        print(f"      - ID: {row[0]} | Payload: {row[1]}")

if __name__ == "__main__":
    asyncio.run(run_stress_test())
