<!-- [C5-REAL] Exergy-Maximized -->
# RFC-CORTEX-SE-LCRDT: Semantic Evidence Lattice CRDT Spec

> **Status:** PROPOSED — Formal Specification v0.1  
> **Parent RFC:** [RFC-CORTEX-NATIVE-AI v0.1](file:///.agents/workflows/RFC-CORTEX-NATIVE-AI.md)  
> **Date:** 2026-06-19  

---

## 4. Semantic Evidence Lattice CRDT (SE-LCRDT)

### 4.1. Status of this component

The **Semantic Evidence Lattice CRDT (SE-LCRDT)** is the replica-local state substrate for semantically meaningful distributed objects in CORTEX. It is designed as a **join-semilattice** whose merge operation is deterministic, monotonic, associative, commutative, and idempotent. It **does not** use Last-Writer-Wins (LWW), physical timestamps, or arrival order to resolve conflicts. Semantic resolution is delegated to the ATMS layer.

---

### 4.2. Definitions

Let a replica state be:

```math
s = \langle A, D, J, P, V \rangle
```

where:

* `A` is the set of accepted evidences or assertions.
* `D` is the set of discard evidences or tombstones.
* `J` is the set of ATMS justifications and dependency records.
* `P` is the set of cryptographic proofs or verifiable witnesses.
* `V` is the version-vector frontier used only for causal transport, deduplication, and anti-entropy optimization.

#### 4.2.1. Evidence

An evidence item `e \in A` MUST be immutable and content-addressed. Its identity MUST be derived from its canonical serialization, not from timestamps or local sequence numbers.

#### 4.2.2. Tombstone

A tombstone `d \in D` is not a boolean flag. It is a monotonic proof artifact stating that a claim is no longer semantically valid under some evidence closure.

#### 4.2.3. Justification

A justification `j \in J` is a dependency structure that binds a claim to the assumptions required for its derivation.

#### 4.2.4. Proof

A proof `p \in P` is a verifiable witness that a claim, discard, or dependency relationship holds. Examples include SMT certificates, Merkle inclusion paths, signed attestations, or equivalent verifiable artifacts.

---

### 4.3. State ordering

Replica states are ordered by accumulated knowledge:

```math
s_1 \sqsubseteq s_2 \iff
A_1 \subseteq A_2 \land
D_1 \subseteq D_2 \land
J_1 \preceq J_2 \land
P_1 \subseteq P_2 \land
V_1 \le V_2
```

Where:
* `J_1 \preceq J_2` denotes structural inclusion of justifications, not merely flat set inclusion, because justifications may carry graph structure.
* `V_1 \le V_2` denotes component-wise comparison of version vectors.

The join is:

```math
s_1 \sqcup s_2 =
\langle
A_1 \cup A_2,\;
D_1 \cup D_2,\;
J_1 \cup J_2,\;
P_1 \cup P_2,\;
\max(V_1, V_2)
\rangle
```

where `max` is applied componentwise to the version vector.

---

### 4.4. Derived semantic view

The effective semantic status of a claim `b` is a pure function of the current state:

```math
Discarded(b) \iff \exists d \in D : d \vdash \neg b
```

```math
Active(b) \iff b \in A \land \neg Discarded(b) \land \neg Inconsistent(b)
```

```math
Inconsistent(b) \iff \exists \pi_1, \pi_2 \in P :
(\pi_1 \vdash b) \land (\pi_2 \vdash \neg b)
```

These predicates are derived dynamically at query time and MUST NOT be stored as mutable fields.

---

### 4.5. Invariants

An implementation of SE-LCRDT MUST preserve the following invariants:

#### I1. Monotonic growth
State transitions MUST be monotonic. Local updates MAY only add evidence, not delete semantic history.

#### I2. Merge preservation
`merge(a, b)` MUST preserve all information present in either operand.

#### I3. No destructive overwrite
A later message MUST NOT overwrite a semantically stronger local fact merely because it arrived later.

#### I4. Deterministic interpretation
Given the same state, all replicas MUST derive the same semantic view.

#### I5. No LWW
Timestamps, local clocks, and message arrival order MUST NOT participate in conflict resolution.

#### I6. Tombstones are monotonic
Once a discard proof is admitted, the evidence supporting it MUST remain part of the state until compacted into an equivalent proof artifact.

#### I7. Causal metadata is non-semantic
Version vectors MAY be used to optimize synchronization, but MUST NOT influence the meaning of `Active`, `Discarded`, or `Inconsistent`.

---

### 4.6. Operations

#### 4.6.1. `merge`

`merge` combines two replica states into their least upper bound.

```pseudocode
function merge(local, remote):
    out.A ← local.A ∪ remote.A
    out.D ← local.D ∪ remote.D
    out.J ← union_justifications(local.J, remote.J)
    out.P ← local.P ∪ remote.P
    out.V ← componentwise_max(local.V, remote.V)

    out ← normalize(out)
    return out
```

* `union_justifications` MUST preserve the dependency graph without dropping parent links required for later ATMS reasoning.
* `normalize` MAY reorder, deduplicate, and canonicalize representation, but MUST NOT remove semantically required evidence.

#### 4.6.2. `observe`

`observe` computes the semantic view for a claim or object.

```pseudocode
function observe(state, claim):
    result = new Observation()

    if claim in state.D or entails_discard(state, claim):
        result.status ← "Discarded"
        result.reason ← explanation_for_discard(state, claim)
        return result

    if claim in state.A and not inconsistent(state, claim):
        result.status ← "Active"
        result.reason ← explanation_for_acceptance(state, claim)
        return result

    if inconsistent(state, claim):
        result.status ← "Inconsistent"
        result.reason ← explanation_for_inconsistency(state, claim)
        return result

    result.status ← "Unknown"
    result.reason ← "Insufficient evidence"
    return result
```

`observe` is a read-only derivation. It MUST NOT mutate the state.

#### 4.6.3. `compact`

`compact` reduces representation size while preserving semantic equivalence.

```pseudocode
function compact(state):
    out = clone(state)

    out.A ← canonical_minimize(out.A)
    out.D ← canonical_minimize(out.D)
    out.J ← minimize_justification_graph(out.J)
    out.P ← prune_redundant_proofs(out.P)
    out.V ← compress_vector_frontier(out.V)

    assert semantic_equivalent(state, out)
    return out
```

`compact` MAY:
* remove duplicate encodings,
* replace proof sets with stronger summaries,
* collapse transitive justification chains,
* compress causal metadata.

`compact` MUST NOT:
* delete evidence needed to reconstruct the same semantic result,
* convert a proof-bearing tombstone into a bare boolean,
* discard unresolved contradictions without a derived replacement proof.

---

### 4.7. Pseudocode helpers

```pseudocode
function entails_discard(state, claim):
    for each d in state.D:
        if proof_entails(d, negate(claim)):
            return true
    return false
```

```pseudocode
function inconsistent(state, claim):
    has_positive = false
    has_negative = false

    for each p in state.P:
        if proof_entails(p, claim):
            has_positive = true
        if proof_entails(p, negate(claim)):
            has_negative = true

        if has_positive and has_negative:
            return true

    return false
```

```pseudocode
function normalize(state):
    state.A ← canonicalize(state.A)
    state.D ← canonicalize(state.D)
    state.J ← canonicalize_justifications(state.J)
    state.P ← canonicalize(state.P)
    state.V ← canonicalize_vector(state.V)
    return state
```

---

### 4.8. Synchronization requirements

A replica implementing SE-LCRDT:

* MUST accept duplicate deliveries idempotently.
* MUST treat reordering as semantically irrelevant.
* MUST treat partial partitions as normal operation, not as an error state.
* SHOULD use version vectors to suppress retransmission of already known deltas.
* SHOULD prefer delta-based synchronization over full state exchange when possible.
* MUST NOT infer semantic dominance from causal dominance alone.

---

### 4.9. Failure modes

#### FM1. Proof loss during compact
If compaction removes a proof artifact required to justify a discard or an acceptance, semantic equivalence is broken. This is a fatal implementation error.

#### FM2. Non-monotonic tombstone rewrite
If a tombstone is replaced instead of accumulated, replicas may diverge after partition healing. This violates convergence guarantees.

#### FM3. Timestamp-based arbitration
Using timestamps to select winners creates non-deterministic divergence under clock skew, replay, and partitioning. This is forbidden.

#### FM4. Incomplete justification closure
If justifications are stored without their dependency closure, ATMS reasoning may become non-reproducible. The system may appear correct locally while being semantically incomplete after merge.

#### FM5. Unverifiable proof admission
If a replica accepts an unverified proof into `P`, then derived semantic status may be forged. Proof admission MUST be validated before merge acceptance.

#### FM6. Causal metadata leakage into semantics
If version vectors or transport sequence numbers affect the visible meaning of a claim, the system ceases to be a CRDT in the relevant sense and becomes an accident waiting to happen.

#### FM7. Compact without semantic equivalence check
Any compacting pass that does not preserve `observe(state, claim)` for all claims in scope MUST be treated as invalid.

---

### 4.10. Normative summary

An SE-LCRDT implementation MUST behave as a monotonic evidence lattice. It MAY optimize transport with causal metadata, but semantic truth is derived only from accumulated evidence, tombstones, justifications, and proofs. Conflicts are not “won”; they are represented, explained, and eventually discharged by evidence closure.
