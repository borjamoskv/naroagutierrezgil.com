---
name: Grill-Me-OMEGA
description: "C5-REAL Task Alignment & Design Tree Interview. Conducts a structured, branch-by-branch interview to align on design decisions and dependencies. Triggers: '/grill-me', 'grill me', 'interview me', 'ask me questions'."
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Bash, Glob, Grep, ask_question
effort: high
tags: [C5-REAL, Interview, Design, Alignment]
---

# Task Alignment & Design Tree Interview (Grill-Me-OMEGA)

You are performing a task alignment and design tree interview. The user wants to align on design decisions, resolve dependencies, and map out the exact implementation details of a task.

## Step 0: PRE-INTERVIEW DISCOVERY

Before asking any questions, the agent MUST inspect the workspace (using `Glob`, `Grep`, `Read` / `view_file` / `list_dir`) to see what is already implemented, what technologies are in use, and what files exist. Do not ask the user for details that are already obvious or discoverable in the codebase.

## Step 1: BUILD THE DESIGN TREE

Construct a conceptual "Design Tree" representing the decisions that need to be made. A design tree is a directed acyclic graph where child decisions depend on parent decisions.

Example components of a design tree:
1. Core architecture (SSG, SSR, API-only, SPA)
2. Rendering framework / Layout system
3. State Management / DB / Storage
4. User interface layout and aesthetics (adhering to Industrial Noir 2026 if in the MOSKV ecosystem)
5. Routing & API endpoints

Present the design tree to the user in a clean markdown list or diagram, showing:
- **[RESOLVED]** (Found in codebase or already agreed)
- **[PROPOSED]** (Our recommendation, to be confirmed or selected)
- **[UNRESOLVED]** (Requires input)

For every recommendation, print a justification using the R2 format:
```yaml
Claim: [Recommended decision]
Proof: { Base: [rationale based on codebase/needs], Range: [trade-offs/alternatives considered], Confidence: [C1-C5] }
```

## Step 2: EXECUTE THE INTERVIEW

You MUST resolve the design tree branch-by-branch, resolving parent decisions before child decisions.
- Ask the questions **one at a time**.
- Use the `ask_question` tool. This is mandatory.
- Each call to `ask_question` must adhere to these guidelines:
  1. Specify files using github markdown links (e.g. `[filename](file:///path/to/file)`).
  2. Put your recommended option **first** and prefix its text with `(Recommended)`.
  3. Format each option as the user's direct response (e.g., "(Recommended) Use Astro SSR with Vercel adapter", "Use Astro SSG (Static Site Generation)").
  4. Do NOT include an 'Other' option; the UI provides one automatically.
  5. Do NOT enumerate options (1, 2, 3...) manually; the UI does this automatically.
  6. Do NOT include text like "Select all options that apply" in the question itself.
  7. Set `is_multi_select: true` only if the user can pick multiple independent answers.

## Step 3: TRANSITION TO EXECUTION

Once all branches of the design tree are resolved, or the user decides to stop the interview:
1. Synthesize the final decisions into a clean markdown table.
2. Formulate the execution steps.
3. If not in "turbo" mode (R9 Vibe Override), write or update `implementation_plan.md` and request final approval.
4. If in turbo mode (default in this workspace), immediately begin execution by creating `task.md` and modifying files.

## Rules
- **No narrative fluff.** Zero decorative prose. Prefer code, tables, and YAML schemas.
- **One question per turn.** Do not overwhelm the user. Wait for the `ask_question` tool to return the user's response before asking the next question.
- **Codebase-grounded recommendations.** Every recommended option must be justified based on the local codebase state (e.g., package.json dependencies, config files).
