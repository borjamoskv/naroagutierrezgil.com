"""
execution_ledger.py — C7-REAL Domain-Aware Telemetry Store

Append-only. Shared hitl.db. Indexed by (domain, backend).
Feeds P(failure | backend, domain) to the Bayesian CostScheduler.
"""
import sqlite3
import time
import contextlib
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).parent / "hitl.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS execution_ledger (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ts          REAL    NOT NULL,
    intent_kind TEXT    NOT NULL,
    domain      TEXT    NOT NULL DEFAULT '',
    backend     TEXT    NOT NULL,
    cost_eval   REAL    NOT NULL,
    outcome     TEXT    NOT NULL CHECK(outcome IN ('success','failure','escalated')),
    duration_ms INTEGER,
    error_type  TEXT
);
CREATE INDEX IF NOT EXISTS idx_ledger_domain_backend
    ON execution_ledger(domain, backend);
"""


@contextlib.contextmanager
def _conn():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    try:
        con.executescript(SCHEMA)
        yield con
        con.commit()
    finally:
        con.close()


def record(intent_kind: str, domain: str, backend: str,
           cost_eval: float, outcome: str,
           duration_ms: int = None, error_type: str = None):
    with _conn() as con:
        con.execute(
            """INSERT INTO execution_ledger
               (ts, intent_kind, domain, backend, cost_eval, outcome, duration_ms, error_type)
               VALUES (?,?,?,?,?,?,?,?)""",
            (time.time(), intent_kind, domain, backend,
             cost_eval, outcome, duration_ms, error_type)
        )


def failure_rate(backend: str, domain: str = '', window: int = 50) -> float:
    """P(failure | backend, domain) from last N executions."""
    with _conn() as con:
        rows = con.execute(
            """SELECT outcome FROM execution_ledger
               WHERE backend=? AND domain LIKE ?
               ORDER BY ts DESC LIMIT ?""",
            (backend, f"%{domain}%" if domain else "%", window)
        ).fetchall()
    if not rows:
        return 0.0  # no data → optimistic prior
    failures = sum(1 for r in rows if r["outcome"] == "failure")
    return failures / len(rows)


def domain_stats(domain: str) -> dict:
    with _conn() as con:
        rows = con.execute(
            """SELECT backend,
                      COUNT(*) as total,
                      SUM(outcome='failure') as fails,
                      AVG(duration_ms) as avg_ms
               FROM execution_ledger
               WHERE domain LIKE ?
               GROUP BY backend""",
            (f"%{domain}%",)
        ).fetchall()
    return {r["backend"]: dict(r) for r in rows}


def global_stats() -> dict:
    """Aggregate stats across all domains, per backend."""
    with _conn() as con:
        rows = con.execute(
            """SELECT backend,
                      COUNT(*) as total,
                      SUM(outcome='failure') as fails,
                      SUM(outcome='escalated') as escalated,
                      AVG(duration_ms) as avg_ms,
                      AVG(cost_eval) as avg_cost
               FROM execution_ledger
               GROUP BY backend"""
        ).fetchall()
    return {r["backend"]: dict(r) for r in rows}
