"""
hitl_store.py — C7-REAL Context-Aware HITL Persistence

Freeze intent into SQLite with full ambient context snapshot
(URL, cookies, screenshot) at moment of escalation.
Converts HITL from "blind gate" to "informed gate".
"""
import sqlite3
import time
import json
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).parent / "hitl.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS hitl_queue (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    ts_created      REAL    NOT NULL,
    ts_resolved     REAL,
    payload         TEXT    NOT NULL,
    context_snapshot TEXT,
    status          TEXT    NOT NULL DEFAULT 'pending'
                            CHECK(status IN ('pending','resolved','expired'))
);
"""


def _init():
    con = sqlite3.connect(DB_PATH)
    con.executescript(SCHEMA)
    con.commit()
    con.close()


def capture_context(driver=None) -> dict:
    """
    Build ambient context snapshot at moment of HITL escalation.
    driver: Selenium/CDP driver instance, optional.
    """
    ctx = {"ts": time.time(), "url": None, "cookies": None, "screenshot_b64": None}
    if driver:
        try:
            ctx["url"] = driver.current_url
        except Exception:
            pass
        try:
            ctx["cookies"] = driver.get_cookies()
        except Exception:
            pass
        try:
            ctx["screenshot_b64"] = driver.get_screenshot_as_base64()
        except Exception:
            pass
    return ctx


def enqueue(payload: dict, driver=None) -> int:
    """
    Freeze intent into SQLite with full context snapshot.
    Returns the row ID (lock key for release).
    """
    _init()
    ctx = capture_context(driver)
    con = sqlite3.connect(DB_PATH)
    cur = con.execute(
        """INSERT INTO hitl_queue (ts_created, payload, context_snapshot, status)
           VALUES (?, ?, ?, 'pending')""",
        (time.time(), json.dumps(payload), json.dumps(ctx))
    )
    row_id = cur.lastrowid
    con.commit()
    con.close()
    return row_id


def release(row_id: int) -> dict:
    """Operator resolves the lock. Returns the original payload + context."""
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    row = con.execute(
        "SELECT * FROM hitl_queue WHERE id=? AND status='pending'",
        (row_id,)
    ).fetchone()
    if not row:
        con.close()
        raise ValueError(f"No pending HITL task with id={row_id}")
    con.execute(
        "UPDATE hitl_queue SET status='resolved', ts_resolved=? WHERE id=?",
        (time.time(), row_id)
    )
    con.commit()
    con.close()
    return {
        "payload": json.loads(row["payload"]),
        "context": json.loads(row["context_snapshot"] or "{}"),
    }


def pending_tasks() -> list:
    """Return all pending HITL tasks with their context snapshots."""
    _init()
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    rows = con.execute(
        "SELECT id, ts_created, payload, context_snapshot FROM hitl_queue "
        "WHERE status='pending' ORDER BY ts_created ASC"
    ).fetchall()
    con.close()
    return [dict(r) for r in rows]


def expire_stale(max_age_s: int = 86400) -> int:
    """Mark tasks older than max_age_s as expired. Returns count."""
    _init()
    cutoff = time.time() - max_age_s
    con = sqlite3.connect(DB_PATH)
    cur = con.execute(
        "UPDATE hitl_queue SET status='expired' WHERE status='pending' AND ts_created < ?",
        (cutoff,)
    )
    count = cur.rowcount
    con.commit()
    con.close()
    return count
