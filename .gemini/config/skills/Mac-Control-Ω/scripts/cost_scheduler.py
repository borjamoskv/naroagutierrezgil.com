"""
cost_scheduler.py — C7-REAL Bayesian Expected-Cost Scheduler

Replaces the linear C = L + F + H model with recursive expected cost:

    E[C_chain] = C_1 + p_f1 * (C_2 + p_f2 * C_3)

where p_f comes from execution_ledger domain-specific history.
Coefficients self-modify via historical amplification — the system
learns its own resistance topology without manual tuning.
"""
from dataclasses import dataclass
import execution_ledger as ledger


@dataclass
class BackendProfile:
    name: str
    base_latency: float
    base_fragility: float
    human_friction: float
    dynamic_fragility: float = 0.0  # set at runtime by detector hooks

    def effective_fragility(self, domain: str) -> float:
        """Base fragility amplified by historical failure rate."""
        hist_rate = ledger.failure_rate(self.name, domain)
        # Bayesian amplification: fragility scales with observed failure rate
        # 0% history → 1x, 50% → 6x, 100% → 11x
        amplifier = 1 + (hist_rate * 10)
        return (self.base_fragility + self.dynamic_fragility) * amplifier

    def total_cost(self, domain: str) -> float:
        return (
            self.base_latency
            + self.effective_fragility(domain)
            + self.human_friction
        )


# ── Backend Registry (mutable at runtime) ────────────────────────
CDP  = BackendProfile("cdp",  base_latency=5,  base_fragility=10,  human_friction=0)
AX   = BackendProfile("ax",   base_latency=30, base_fragility=50,  human_friction=0)
HITL = BackendProfile("hitl", base_latency=0,  base_fragility=0,   human_friction=1000)

CHAIN = [CDP, AX, HITL]


def expected_chain_cost(domain: str) -> list[tuple[BackendProfile, float]]:
    """
    Returns ordered list of (backend, expected_cost) where expected_cost
    includes the probability-weighted cost of cascading into subsequent backends.

    Computed bottom-up:
        E[C_terminal] = C_terminal
        E[C_i]        = C_i + P(fail_i | domain) * E[C_{i+1}]
    """
    results: list[tuple[BackendProfile, float]] = []
    cascade_penalty = 0.0

    for i in range(len(CHAIN) - 1, -1, -1):
        b = CHAIN[i]
        direct = b.total_cost(domain)
        # Use historical failure rate if available, else derive prior from fragility
        p_fail = ledger.failure_rate(b.name, domain) or (b.base_fragility / 500)
        expected = direct + p_fail * cascade_penalty
        cascade_penalty = expected
        results.insert(0, (b, expected))

    return results


def select_backend(domain: str, intent_kind: str = "") -> BackendProfile:
    """
    Auction: pick backend with lowest expected chain cost.
    Returns the BackendProfile winner.
    """
    ranked = expected_chain_cost(domain)
    ranked.sort(key=lambda x: x[1])
    winner, cost = ranked[0]
    return winner


def explain(domain: str) -> list[dict]:
    """
    Debug: returns full cost breakdown for a domain.
    Useful for operator introspection.
    """
    ranked = expected_chain_cost(domain)
    ranked.sort(key=lambda x: x[1])
    return [
        {
            "backend": b.name,
            "expected_cost": round(cost, 2),
            "base_latency": b.base_latency,
            "effective_fragility": round(b.effective_fragility(domain), 2),
            "human_friction": b.human_friction,
            "historical_failure_rate": round(ledger.failure_rate(b.name, domain), 4),
        }
        for b, cost in ranked
    ]
