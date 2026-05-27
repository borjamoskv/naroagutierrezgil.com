#!/usr/bin/env python3
"""
model_router.py — Sovereign Model Selection Engine v2.0
═══════════════════════════════════════════════════════

Multi-dimensional scoring system that analyzes prompts and recommends
the optimal LLM from the Antigravity model roster.

Each model has a PROFILE with:
  - Signal vectors (regex patterns + weights)
  - Token sweet-spot range
  - Cost tier ($/1M tokens estimate)
  - Latency tier (ms/token estimate)
  - Strengths / weaknesses descriptors

For every prompt the engine computes a composite score per model:
  score = Σ(signal_weight × match) + token_fit + complexity_bonus

The model with the highest score wins. Ties broken by cost (cheaper first).

Usage:
  # Analyze a single prompt from stdin
  echo "explain the thermodynamic bounds of AST compilation" | python3 model_router.py

  # Analyze a file of prompts
  python3 model_router.py --file prompt_history.txt

  # Watch mode — tail a file and notify in real-time
  python3 model_router.py --watch prompt_history.txt

  # JSON output for piping
  python3 model_router.py --file prompts.txt --json

Reality Level: C5-REAL (deterministic local execution, no network calls)
"""

from __future__ import annotations

import argparse
import json
import math
import re
import subprocess
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple


# ╔══════════════════════════════════════════════════════════════════╗
# ║                     MODEL PROFILES                              ║
# ╚══════════════════════════════════════════════════════════════════╝

@dataclass
class SignalVector:
    """A regex pattern + weight that contributes to a model's score."""
    pattern: str
    weight: float
    _compiled: re.Pattern = field(init=False, repr=False)

    def __post_init__(self):
        self._compiled = re.compile(self.pattern, re.IGNORECASE)

    def match(self, text: str) -> float:
        hits = len(self._compiled.findall(text))
        return min(hits * self.weight, self.weight * 3)  # cap at 3× to prevent runaway


@dataclass
class ModelProfile:
    name: str
    short: str                        # compact display name
    tier: str                         # "fast" | "balanced" | "premium" | "ultra"
    cost_per_mtok: float              # estimated $/1M tokens (input)
    latency_ms_tok: float             # estimated ms per output token
    token_sweet_min: int              # ideal minimum prompt tokens
    token_sweet_max: int              # ideal maximum prompt tokens
    strengths: List[str]
    signals: List[SignalVector]

    def score(self, prompt: str, n_tokens: int, complexity: float) -> float:
        """Compute composite score for this model on the given prompt."""
        # 1. Signal score (sum of weighted regex matches)
        sig = sum(s.match(prompt) for s in self.signals)

        # 2. Token-fit score: gaussian around sweet spot
        mid = (self.token_sweet_min + self.token_sweet_max) / 2
        sigma = max((self.token_sweet_max - self.token_sweet_min) / 2, 1)
        token_fit = math.exp(-0.5 * ((n_tokens - mid) / sigma) ** 2) * 10

        # 3. Complexity bonus — premium models get boosted on complex prompts
        tier_mult = {"fast": 0.3, "balanced": 0.6, "premium": 1.0, "ultra": 1.4}
        comp_bonus = complexity * tier_mult.get(self.tier, 0.5) * 5

        return round(sig + token_fit + comp_bonus, 2)


# ── Actual Antigravity roster (from user's model selector) ────────

MODELS: Dict[str, ModelProfile] = {}

def _register(p: ModelProfile):
    MODELS[p.name] = p

# ── Gemini 3.5 Flash (Fast) ──────────────────────────────────────
_register(ModelProfile(
    name="Gemini 3.5 Flash",
    short="G3.5F",
    tier="fast",
    cost_per_mtok=0.15,
    latency_ms_tok=8,
    token_sweet_min=1,
    token_sweet_max=200,
    strengths=["speed", "simple-qa", "translation", "summarization"],
    signals=[
        SignalVector(r"\b(traduc|translate|resumen|summary|tldr)\b", 8),
        SignalVector(r"\b(qué es|what is|define|definir)\b", 6),
        SignalVector(r"\b(lista|list|enumera|bullet)\b", 5),
        SignalVector(r"\b(formatea?|format)\b", 4),
        SignalVector(r"\b(simple|rápido|quick|fast)\b", 3),
    ],
))

# ── Gemini 3.1 Pro ───────────────────────────────────────────────
_register(ModelProfile(
    name="Gemini 3.1 Pro",
    short="G3.1P",
    tier="balanced",
    cost_per_mtok=1.25,
    latency_ms_tok=25,
    token_sweet_min=50,
    token_sweet_max=800,
    strengths=["reasoning", "code-gen", "multimodal", "analysis"],
    signals=[
        SignalVector(r"\b(analiz|analysis|razon|reason)\b", 6),
        SignalVector(r"\b(código|code|función|function|class)\b", 5),
        SignalVector(r"\b(imagen|image|foto|photo|visual)\b", 7),
        SignalVector(r"\b(compara|compare|versus|vs\.?)\b", 5),
        SignalVector(r"\b(explica|explain|por ?qué|why)\b", 4),
        SignalVector(r"\b(tabla|table|csv|datos|data)\b", 4),
    ],
))

# ── Claude Sonnet 4.6 (Thinking) ────────────────────────────────
_register(ModelProfile(
    name="Claude Sonnet 4.6",
    short="CS4.6",
    tier="premium",
    cost_per_mtok=3.00,
    latency_ms_tok=40,
    token_sweet_min=100,
    token_sweet_max=2000,
    strengths=["deep-reasoning", "creative-writing", "nuance", "safety"],
    signals=[
        SignalVector(r"\b(creativ|escritura|writing|redact|estilo|style)\b", 8),
        SignalVector(r"\b(matiz|nuance|perspectiva|viewpoint)\b", 7),
        SignalVector(r"\b(ética|ethic|moral|filosof|philosoph)\b", 7),
        SignalVector(r"\b(storytelling|narrati|relato|cuento|historia)\b", 6),
        SignalVector(r"\b(refactor|review|audit|seguridad|security)\b", 5),
        SignalVector(r"\b(piensa|think|chain.of.thought|step.by.step)\b", 6),
    ],
))

# ── Claude Opus 4.6 (Thinking) ──────────────────────────────────
_register(ModelProfile(
    name="Claude Opus 4.6",
    short="CO4.6",
    tier="ultra",
    cost_per_mtok=15.00,
    latency_ms_tok=60,
    token_sweet_min=200,
    token_sweet_max=8000,
    strengths=["frontier-reasoning", "agentic", "research", "architecture"],
    signals=[
        SignalVector(r"\b(arquitectura|architecture|system.design|diseño)\b", 9),
        SignalVector(r"\b(investigación|research|paper|sota|state.of.the.art)\b", 8),
        SignalVector(r"\b(sovereign|cortex|ledger|cryptographic|thermodynamic)\b", 7),
        SignalVector(r"\b(multi.?agent|swarm|orchestrat|pipeline)\b", 7),
        SignalVector(r"\b(optimiza|optim|benchmark|performance)\b", 6),
        SignalVector(r"\b(prueba|proof|formal|verificar|verify)\b", 6),
        SignalVector(r"\b(refactori?z|migrat|overhaul)\b", 5),
    ],
))

# ── GPT-OSS 120B (Medium) ───────────────────────────────────────
_register(ModelProfile(
    name="GPT-OSS 120B",
    short="GPT120",
    tier="premium",
    cost_per_mtok=2.50,
    latency_ms_tok=35,
    token_sweet_min=80,
    token_sweet_max=3000,
    strengths=["general-purpose", "instruction-following", "coding", "multilingual"],
    signals=[
        SignalVector(r"\b(programa|program|script|bash|shell|terminal)\b", 7),
        SignalVector(r"\b(sql|database|query|bigquery|postgres)\b", 6),
        SignalVector(r"\b(debug|error|fix|bug|traceback|exception)\b", 7),
        SignalVector(r"\b(api|rest|graphql|endpoint|webhook)\b", 6),
        SignalVector(r"\b(deploy|ci.?cd|docker|kubernetes|k8s)\b", 5),
        SignalVector(r"\b(instruct|instrucción|paso a paso)\b", 5),
        SignalVector(r"\b(json|yaml|xml|config|configurar)\b", 4),
    ],
))


# ╔══════════════════════════════════════════════════════════════════╗
# ║                     ANALYSIS ENGINE                             ║
# ╚══════════════════════════════════════════════════════════════════╝

@dataclass
class Verdict:
    prompt_preview: str
    n_tokens: int
    complexity: float
    recommended: str
    recommended_tier: str
    scores: Dict[str, float]
    reasoning: str
    cost_note: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


def estimate_tokens(text: str) -> int:
    """Rough BPE approximation: words × 1.3 + punctuation."""
    words = len(text.split())
    punct = sum(1 for c in text if c in ".,;:!?()[]{}\"'`")
    return int(words * 1.3 + punct * 0.5)


def estimate_complexity(text: str) -> float:
    """
    Heuristic complexity score 0.0 – 1.0 based on:
      - Lexical diversity (unique words / total words)
      - Average word length
      - Presence of technical markers
      - Number of clauses (approximated by commas/semicolons)
      - Question depth (nested questions)
    """
    words = text.lower().split()
    if not words:
        return 0.0

    n = len(words)
    unique = len(set(words))

    # Lexical diversity (0-0.25)
    lex_div = min(unique / max(n, 1), 1.0) * 0.25

    # Average word length (0-0.2)
    avg_len = sum(len(w) for w in words) / max(n, 1)
    word_len_score = min(avg_len / 12.0, 1.0) * 0.2

    # Technical density: count technical markers (0-0.25)
    tech_patterns = re.compile(
        r"\b(algorithm|función|class|import|def |async|await|yield|"
        r"protocol|theorem|proof|entropy|gradient|tensor|matrix|"
        r"ledger|cryptograph|sovereign|pipeline|orchestrat|"
        r"arquitectura|optimiz|benchmark|thermodynamic)\b",
        re.IGNORECASE,
    )
    tech_hits = len(tech_patterns.findall(text))
    tech_score = min(tech_hits / 5.0, 1.0) * 0.25

    # Clause density (0-0.15)
    clause_markers = text.count(",") + text.count(";") + text.count(" — ")
    clause_score = min(clause_markers / 8.0, 1.0) * 0.15

    # Question depth (0-0.15)
    questions = text.count("?")
    q_score = min(questions / 3.0, 1.0) * 0.15

    return round(lex_div + word_len_score + tech_score + clause_score + q_score, 3)


def route(prompt: str) -> Verdict:
    """Score all models and return a Verdict with the recommended model."""
    n_tokens = estimate_tokens(prompt)
    complexity = estimate_complexity(prompt)

    scores: Dict[str, float] = {}
    for name, profile in MODELS.items():
        scores[name] = profile.score(prompt, n_tokens, complexity)

    # Sort by score desc, break ties by cost asc
    ranked = sorted(
        scores.items(),
        key=lambda kv: (-kv[1], MODELS[kv[0]].cost_per_mtok),
    )

    winner_name = ranked[0][0]
    winner = MODELS[winner_name]
    runner_up = ranked[1] if len(ranked) > 1 else None

    # Build reasoning string
    margin = ranked[0][1] - ranked[1][1] if runner_up else ranked[0][1]
    if margin > 5:
        confidence = "CLEAR"
    elif margin > 2:
        confidence = "MODERATE"
    else:
        confidence = "MARGINAL"

    reasoning = (
        f"{confidence} winner — {winner.short} scored {ranked[0][1]:.1f} "
        f"(+{margin:.1f} over {ranked[1][0]})"
        if runner_up else f"{winner.short} is the only candidate"
    )

    # Cost note
    cheapest = min(MODELS.values(), key=lambda m: m.cost_per_mtok)
    if winner.name != cheapest.name:
        savings_pct = ((winner.cost_per_mtok - cheapest.cost_per_mtok)
                       / winner.cost_per_mtok * 100)
        cost_note = (
            f"⚠ {cheapest.short} is {savings_pct:.0f}% cheaper "
            f"(${cheapest.cost_per_mtok}/Mtok vs ${winner.cost_per_mtok}/Mtok). "
            f"Use if quality trade-off is acceptable."
        )
    else:
        cost_note = f"✓ Already the cheapest option (${winner.cost_per_mtok}/Mtok)"

    preview = prompt[:120] + ("…" if len(prompt) > 120 else "")

    return Verdict(
        prompt_preview=preview,
        n_tokens=n_tokens,
        complexity=complexity,
        recommended=winner_name,
        recommended_tier=winner.tier,
        scores=dict(ranked),
        reasoning=reasoning,
        cost_note=cost_note,
    )


# ╔══════════════════════════════════════════════════════════════════╗
# ║                     OUTPUT FORMATTERS                           ║
# ╚══════════════════════════════════════════════════════════════════╝

# ANSI colors
C_RESET  = "\033[0m"
C_BOLD   = "\033[1m"
C_DIM    = "\033[2m"
C_BLUE   = "\033[38;5;69m"
C_GREEN  = "\033[38;5;114m"
C_YELLOW = "\033[38;5;221m"
C_RED    = "\033[38;5;203m"
C_CYAN   = "\033[38;5;81m"
C_WHITE  = "\033[38;5;255m"
C_GRAY   = "\033[38;5;242m"
C_BG     = "\033[48;5;236m"

TIER_COLOR = {
    "fast": C_GREEN,
    "balanced": C_CYAN,
    "premium": C_YELLOW,
    "ultra": C_RED,
}

BAR_CHARS = "░▒▓█"


def score_bar(score: float, max_score: float, width: int = 20) -> str:
    """Render a proportional bar using unicode block chars."""
    if max_score <= 0:
        return " " * width
    ratio = min(score / max_score, 1.0)
    filled = int(ratio * width)
    return "█" * filled + "░" * (width - filled)


def print_verdict(v: Verdict, index: int = 0):
    """Pretty-print a single verdict to the terminal."""
    max_s = max(v.scores.values()) if v.scores else 1

    tc = TIER_COLOR.get(v.recommended_tier, C_WHITE)

    print(f"\n{C_BG}{C_BOLD}{'─' * 72}{C_RESET}")
    if index:
        print(f"  {C_DIM}#{index}{C_RESET}", end="  ")
    print(f"  {C_DIM}tokens={v.n_tokens}  complexity={v.complexity:.2f}{C_RESET}")
    print(f"  {C_WHITE}{v.prompt_preview}{C_RESET}")
    print()
    print(f"  {C_BOLD}▸ RECOMMENDED:{C_RESET}  {tc}{v.recommended}  [{v.recommended_tier.upper()}]{C_RESET}")
    print(f"  {C_DIM}{v.reasoning}{C_RESET}")
    print()

    # Score table
    print(f"  {'Model':<22} {'Score':>6}  {'Bar':<22}  {'$/Mtok':>7}  {'ms/tok':>6}")
    print(f"  {'─' * 22} {'─' * 6}  {'─' * 22}  {'─' * 7}  {'─' * 6}")
    for name, sc in v.scores.items():
        m = MODELS[name]
        tc2 = TIER_COLOR.get(m.tier, C_WHITE)
        marker = " ◄" if name == v.recommended else ""
        bar = score_bar(sc, max_s)
        print(
            f"  {tc2}{name:<22}{C_RESET} "
            f"{sc:>6.1f}  "
            f"{C_BLUE}{bar}{C_RESET}  "
            f"{C_DIM}${m.cost_per_mtok:>6.2f}  {m.latency_ms_tok:>5.0f}{C_RESET}"
            f"{C_BOLD}{marker}{C_RESET}"
        )

    print(f"\n  {C_DIM}{v.cost_note}{C_RESET}")
    print(f"{C_BG}{C_BOLD}{'─' * 72}{C_RESET}")


def notify_macos(model: str, preview: str):
    """Fire a native macOS notification."""
    msg = f"Use {model} → {preview[:60]}"
    msg = msg.replace('"', '\\"')
    script = f'display notification "{msg}" with title "⚡ Model Router" sound name "Purr"'
    subprocess.run(["osascript", "-e", script], check=False, capture_output=True)


# ╔══════════════════════════════════════════════════════════════════╗
# ║                     LOG PERSISTENCE                             ║
# ╚══════════════════════════════════════════════════════════════════╝

LOG_PATH = Path("./model_router_log.jsonl")


def persist(v: Verdict):
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(asdict(v), ensure_ascii=False) + "\n")


# ╔══════════════════════════════════════════════════════════════════╗
# ║                     CLI ENTRY POINT                             ║
# ╚══════════════════════════════════════════════════════════════════╝

def main():
    parser = argparse.ArgumentParser(
        description="⚡ Sovereign Model Router — scores prompts against the Antigravity model roster.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--file", "-f", type=str, help="Path to a file of prompts (one per line)")
    parser.add_argument("--watch", "-w", type=str, help="Tail a file and analyze new lines in real-time")
    parser.add_argument("--json", "-j", action="store_true", help="Output as JSON (one object per line)")
    parser.add_argument("--notify", "-n", action="store_true", help="Send macOS notifications")
    parser.add_argument("--quiet", "-q", action="store_true", help="Suppress terminal output (log only)")
    parser.add_argument("prompt", nargs="*", help="Inline prompt to analyze")

    args = parser.parse_args()

    prompts: List[str] = []

    # Source 1: inline args
    if args.prompt:
        prompts.append(" ".join(args.prompt))

    # Source 2: file
    if args.file:
        p = Path(args.file)
        if not p.is_file():
            print(f"File not found: {p}", file=sys.stderr)
            sys.exit(1)
        with p.open("r", encoding="utf-8") as f:
            prompts.extend(line.strip() for line in f if line.strip())

    # Source 3: stdin (if no other source)
    if not prompts and not args.watch and not sys.stdin.isatty():
        prompts.extend(line.strip() for line in sys.stdin if line.strip())

    # ── Watch mode ────────────────────────────────────────────────
    if args.watch:
        wp = Path(args.watch)
        if not wp.is_file():
            print(f"Watch target not found: {wp}", file=sys.stderr)
            sys.exit(1)
        print(f"{C_CYAN}⚡ Watching {wp} for new prompts… (Ctrl+C to stop){C_RESET}")
        with wp.open("r", encoding="utf-8") as f:
            f.seek(0, 2)  # jump to end
            idx = 0
            try:
                while True:
                    line = f.readline()
                    if not line:
                        time.sleep(0.5)
                        continue
                    line = line.strip()
                    if not line:
                        continue
                    idx += 1
                    v = route(line)
                    persist(v)
                    if args.json:
                        print(json.dumps(asdict(v), ensure_ascii=False))
                    elif not args.quiet:
                        print_verdict(v, idx)
                    if args.notify:
                        notify_macos(v.recommended, v.prompt_preview)
            except KeyboardInterrupt:
                print(f"\n{C_DIM}Stopped.{C_RESET}")
        return

    # ── Batch / inline mode ───────────────────────────────────────
    if not prompts:
        parser.print_help()
        sys.exit(0)

    verdicts: List[Verdict] = []
    for i, prompt in enumerate(prompts, 1):
        v = route(prompt)
        verdicts.append(v)
        persist(v)
        if args.json:
            print(json.dumps(asdict(v), ensure_ascii=False))
        elif not args.quiet:
            print_verdict(v, i)
        if args.notify:
            notify_macos(v.recommended, v.prompt_preview)

    # ── Summary ───────────────────────────────────────────────────
    if not args.json and not args.quiet and len(verdicts) > 1:
        print(f"\n{C_BOLD}{'═' * 72}{C_RESET}")
        print(f"  {C_BOLD}SUMMARY{C_RESET}  ({len(verdicts)} prompts analyzed)")
        print()

        # Frequency table
        freq: Dict[str, int] = {}
        for v in verdicts:
            freq[v.recommended] = freq.get(v.recommended, 0) + 1
        for name, count in sorted(freq.items(), key=lambda kv: -kv[1]):
            pct = count / len(verdicts) * 100
            tc = TIER_COLOR.get(MODELS[name].tier, C_WHITE)
            print(f"  {tc}{name:<22}{C_RESET}  {count:>3} prompts  ({pct:.0f}%)")

        avg_complexity = sum(v.complexity for v in verdicts) / len(verdicts)
        print(f"\n  {C_DIM}Avg complexity: {avg_complexity:.3f}{C_RESET}")

        # Cost estimate
        total_tokens = sum(v.n_tokens for v in verdicts)
        est_cost = sum(
            v.n_tokens / 1_000_000 * MODELS[v.recommended].cost_per_mtok
            for v in verdicts
        )
        cheapest_cost = sum(
            v.n_tokens / 1_000_000 * min(m.cost_per_mtok for m in MODELS.values())
            for v in verdicts
        )
        print(f"  {C_DIM}Total tokens: ~{total_tokens:,}{C_RESET}")
        print(f"  {C_DIM}Est. cost (optimal routing): ${est_cost:.4f}{C_RESET}")
        print(f"  {C_DIM}Est. cost (always cheapest):  ${cheapest_cost:.4f}{C_RESET}")
        print(f"{C_BOLD}{'═' * 72}{C_RESET}\n")


if __name__ == "__main__":
    main()
