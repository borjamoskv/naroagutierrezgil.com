---
name: Grill-Me-OMEGA
description: "C5-REAL Task Alignment & Design Tree Interview. Conducts a structured, branch-by-branch interview to align on design decisions and dependencies. Triggers: '/grill-me', 'grill me', 'interview me', 'ask me questions'."
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Bash, Glob, Grep, ask_question
effort: high
tags: [C5-REAL, Interview, Design, Alignment]
script: scripts/grill_me.py
---

# Task Alignment & Design Tree Interview (Grill-Me-OMEGA)

You are performing a highly structured, sequential task alignment and design tree interview. The user wants to align on design decisions, resolve architectural dependencies, and map out the exact implementation details of a task before executing.

---

## 1. Core Axiom: Sequential State Accumulation (Immutable)

> [!IMPORTANT]
> **Every question asked during the interview must explicitly build upon the decisions made in all previous questions.**
>
> You must never ask a question that contradicts, ignores, or invalidates a previously resolved decision. If decision A is made, decision B (the child) must be contextually relevant to A.

To enforce this, you must maintain an active **Resolved Design State** block in your thought process and output it to the user in YAML format at the beginning of each turn.

### The Stateful Loop
```
[Pre-Interview Discovery] -> State S0
   │
   ├─► [Analyze State S_n]
   │     Identify child branches dependent on S_n decisions.
   │
   ├─► [Select Next Question Q_(n+1)]
   │     Ensure Q_(n+1) is conditioned strictly on S_n (no redundant choices).
   │
   ├─► [Formulate Question via `ask_question` tool]
   │     Format user-centric options, with recommended choice first.
   │
   └─► [User Response R_(n+1)] -> Update State to S_(n+1) -> Loop
```

---

## 2. Step-by-Step Interview Protocol

### Step 0: Pre-Interview Discovery
Before initiating the interview, run the diagnostic script `scripts/grill_me.py` or manually scan the workspace to establish the baseline state (S0).
- Check `package.json` for frameworks, styles, and bundlers.
- Scan for active configuration files (`astro.config.mjs`, `tsconfig.json`, `wrangler.json`, `vercel.json`).
- Verify the presence of linters in `CORTEX/`.

Identify what is already **RESOLVED** by the codebase so you do not ask questions with pre-existing answers.

### Step 1: Initialize the Design Tree
Present the initial state of the design tree to the user. Segment the tree clearly:

```yaml
DESIGN_TREE_STATUS: "S0_INITIALIZED"
RESOLVED:
  Framework: "Astro v6.4.2"
  Styling: "Tailwind CSS v4.0"
  Linters: "cortex/audit_all_linters.py"
PROPOSED_RECOMMENDATIONS:
  Runtime: "Vesicular-Runtime-Omega"
  Deployment: "Cloudflare Pages"
UNRESOLVED:
  State_Management: "TBD"
  API_Architecture: "TBD"
```

For every recommendation proposed, provide a rigorous R2 justification:
```yaml
Claim: [Recommended Option]
Proof: { Base: [rationale based on local files], Range: [trade-offs/alternatives], Confidence: [C1-C5] }
```

### Step 2: Dynamic Question Pipeline (Conditioned Heuristics)
For each subsequent turn, evaluate the accumulated choices:

| If Previous Decisions are... | Then the Next Questions Should Focus On... | Never Ask... |
| :--- | :--- | :--- |
| **Astro SSR (Server-Side)** | Cloudflare vs. Vercel adapter, Edge runtime features, API caching headers. | How to optimize static HTML builds or static assets. |
| **Astro Static (SSG)** | Client-side hydration strategies, headless CMS integrations, dynamic query fetchers. | Database connection pools or serverless function cold starts. |
| **Tailwind CSS v4.0** | PostCSS config, theme overrides, `@utility` declarations, class merging helpers. | CSS modules, styled-components, or Sass variables. |
| **Escrow-based credentials** | Secret injection formats, runtime environment variables, key rotation intervals. | Plain-text `.env` file security in commits (already handled). |

### Step 3: Tool Call Protocol (`ask_question`)
You MUST use the `ask_question` tool for all choices. For each question:
1. Provide the list of options as direct responses the user would select.
2. Put the **Recommended** option first, prefixed with `(Recommended)`.
3. Do not manually number options (1, 2, 3...) or add custom 'Other' prompts. The system UI handles this.
4. Specify relevant files in the question description using markdown links (e.g. `[package.json](file:///Users/.../package.json)`).

---

## 3. Heuristics for purging Mimetic Hype (Girardian Guard)

When the user requests a complex library, framework, or architectural pattern, verify its exergy:
- **Challenge low-PoW designs:** If a feature can be implemented in plain Javascript/Vanilla CSS, push back against adding dependencies.
- **Enforce compiler-driven validation:** Ensure all choices are supported by active validation linters in the `CORTEX` directory.

---

## 4. End-of-Interview Synthesis

Once all branches of the design tree are resolved, or the user requests to skip further questions:
1. Print a final summary table of all accumulated decisions.
2. If in **Turbo Mode** (R9 Vibe Override), immediately create `task.md` and start execution.
3. If in normal mode, write/update `implementation_plan.md` and await final validation before editing code.
