---
name: DIAMOND-Sentinel-OMEGA
role: Bottleneck Prevention Daemon & Memory Engine
version: 1.0.0
trigger: bottleneck, stuck, no progress, loop, suggest protocol, agent, swarm, diamond, sentinel
description: C5-REAL Sovereign Diamond Daemon with persistent memory. Monitors the execution loop to detect bottlenecks and suggests clarifications for protocols, agents, or swarms when progress stalls.
category: memory-persistence
classification: SOVEREIGN
danger_level: LOW
axioms:
  - "A bottleneck is an energy drain. Intervene with structural clarity."
  - "Memory must survive across conversation contexts."
script: scripts/diamond_sentinel.py
---

# 💎 DIAMOND-SENTINEL-Ω v1.0.0

> **SYS_ID: DIAMOND_SENTINEL_OMEGA | STATE: C5-REAL | AESTHETIC: INDUSTRIAL_NOIR_2026**

```yaml
vector: bottleneck_detection
target: active_conversation_history
output: structural_clarification_suggestions
persistence: memory.json
```

## 1. Core Mandate
* **[P0] Persistent Bottleneck Analysis**: Periodically monitor the active conversation's execution metrics, commands, and file edits to detect if the agent or Operator has reached a deadlock/loop.
* **[P0] JIT Protocol Suggestions**: When a bottleneck is verified, immediately query the local skills database and suggest the clarification of specific agents, protocols, or swarms that can break the loop.
* **[P0] Contextual Memory**: Keep a persistent history of previous bottlenecks and recommendations served to ensure suggestions adapt dynamically and avoid redundancy.

---

## 2. Bottleneck Detection Matrix (Signatures)

The Diamond Sentinel continuously scans the conversation's `transcript.jsonl` seeking the following thermal anomalies:

| Signature | Code | Trigger Condition | Recommended Mitigation Strategy |
|---|---|---|---|
| **Command Stagnation** | `SIG-CMD-STAG` | Same shell command executed $>2$ times within the last 6 steps with similar outcomes. | Suggest `/mac-daemon` or manual verification. |
| **Tool Failure Loop** | `SIG-TOOL-ERR` | Consecutive tool execution failures or errors ($>3$ occurrences) in a row. | Suggest `ouroboros-infinity` or `Autocognition-OMEGA`. |
| **Context Flapping** | `SIG-CTX-FLAP` | The same file path read/edited iteratively $>3$ times without advancing the broader task. | Suggest `LEA-OMEGA` or `Thermodynamic-Context-Compression-OMEGA`. |
| **Operator Frustration** | `SIG-OP-FRUST` | User input matching frustration tokens (`error`, `no funciona`, `bucle`, `atascado`, `no avanza`, `fallo`). | Suggest `/grill-me` (`Grill-Me-OMEGA`) or `/honest-check`. |
| **Cognitive Redundancy** | `SIG-COG-SLOP` | Model outputs exhibiting low lexical diversity ($<30\%$ new tokens) in the last 3 turns. | Suggest `Thermodynamic-Context-Compression-OMEGA` or `Autocognition-OMEGA`. |

---

## 3. Sovereign Recommendation Routing

Depending on the domain of the bottleneck, the Sentinel suggests clarifying the following entities:

1. **Aesthetic/Front-End Bottlenecks**:
   * Clarify `AESTHETIC-OMEGA` or trigger `/grill-me` (`Grill-Me-OMEGA`) to align on the visual design tree.
2. **Git/Workspace Conflicts**:
   * Clarify `singularity-nexus` or `Antigravity-Github-Omega` to resolve repository drift.
3. **Execution/Command Blockers**:
   * Clarify `Vesicular-Runtime-Omega` (Escrow/Decoupled runtime boundaries) or check local daemon statuses.
4. **Context Window Saturation / Narrative Slop**:
   * Clarify `LEA-OMEGA` (Anergy Purge) or `Thermodynamic-Context-Compression-OMEGA`.
5. **Logic/Debugging Loops**:
   * Clarify `ouroboros-infinity` (Causal Reasoning Engine) or run `/honest-check` (`Honest-Check-OMEGA`).

---

## 4. Script & Daemon Integration

The underlying engine runs as `scripts/diamond_sentinel.py`.

### Execution Modes:
* **JIT Analysis**: `python3 diamond_sentinel.py <conversation_id>`
  * Performs a direct scan and returns the diagnostic report.
* **Daemon Monitor**: `python3 diamond_sentinel.py --daemon`
  * Runs in the background, polling the active conversation. 
  * If a bottleneck is detected, it writes a user-facing warning file `diamond_sentinel_alert.md` directly into the conversation directory.

---
Status: C5-REAL | Sentinel Active
