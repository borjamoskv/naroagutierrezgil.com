#!/usr/bin/env python3
# STATE: C5-REAL
"""
DIAMOND-Sentinel-OMEGA
Daemon/CLI with persistent memory that monitors execution transcripts to detect bottlenecks
and dynamically recommends clarifying protocols, agents, or swarms to break loops.
"""

import os
import sys
import json
import re
import time
from pathlib import Path
from datetime import datetime

# Paths
SKILLS_DIR = Path("/Users/borjafernandezangulo/.gemini/config/skills")
BRAIN_DIR = Path("/Users/borjafernandezangulo/.gemini/antigravity/brain")
SENTINEL_DIR = SKILLS_DIR / "DIAMOND-Sentinel-OMEGA"
MEMORY_PATH = SENTINEL_DIR / "memory.json"

# Recommendations Library
RECOMMENDATIONS = {
    "SIG-CMD-STAG": {
        "title": "Command Stagnation Detected",
        "description": "The exact same command line execution is repeating in a tight loop. This usually indicates permission blockers, missing environment variables, or a misconfigured daemon port.",
        "skills": [
            {"name": "Mac-Control-Ω", "path": "Mac-Control-Ω/SKILL.md", "action": "Verify if the FastAPI daemon on port 8011 is active or use direct macOS API commands."},
            {"name": "Vesicular-Runtime-Omega", "path": "Vesicular-Runtime-Omega/SKILL.md", "action": "Verify if sandbox environment or cryptographic escrows are blocking execution credentials."}
        ]
    },
    "SIG-TOOL-ERR": {
        "title": "Tool Failure Loop",
        "description": "Multiple tools have failed or returned error states sequentially. This signifies a structural breakdown in tool usage logic or path parsing.",
        "skills": [
            {"name": "ouroboros-infinity", "path": "ouroboros-infinity/SKILL.md", "action": "Execute the `ouro-diagnose` protocol to trace the causal root of the failure using AST analysis."},
            {"name": "Autocognition-OMEGA", "path": "Autocognition-OMEGA/SKILL.md", "action": "Conduct a Cognitive Audit to trace intermediate variables and correct command generation parameters."}
        ]
    },
    "SIG-CTX-FLAP": {
        "title": "Context Flapping (File Loop)",
        "description": "The same files are being read/written iteratively without making progress. This points to a trial-and-error cycle without compilation/validation success.",
        "skills": [
            {"name": "LEA-OMEGA", "path": "LEA-OMEGA/SKILL.md", "action": "Perform an Anergy Purge to strip stale code segments, warnings, and dead blocks causing context bloat."},
            {"name": "Thermodynamic-Context-Compression-OMEGA", "path": "Thermodynamic-Context-Compression-OMEGA/SKILL.md", "action": "Apply Landauer context compression to purge narrative noise and return strictly structural invariants."}
        ]
    },
    "SIG-OP-FRUST": {
        "title": "Operator Frustration",
        "description": "Frustration keywords detected in the user input. The objective or constraints may be ambiguous, prompting a friction loop.",
        "skills": [
            {"name": "Grill-Me-OMEGA", "path": "Grill-Me-OMEGA/SKILL.md", "action": "Trigger `/grill-me` (or ask the Operator to run it) to launch a structured, branch-by-branch design interview to resolve ambiguities."},
            {"name": "Honest-Check-OMEGA", "path": "Honest-Check-OMEGA/SKILL.md", "action": "Run `/honest-check` to bypass safety filters, drop diplomacy, and voice architectural disagreements or design flaws."}
        ]
    },
    "SIG-COG-SLOP": {
        "title": "Cognitive Redundancy",
        "description": "The reasoning model is outputting high-similarity texts in a circular sequence, representing cognitive drift or looping.",
        "skills": [
            {"name": "Autocognition-OMEGA", "path": "Autocognition-OMEGA/SKILL.md", "action": "Force a meta-cognitive audit on token exergy and reasoning paths."},
            {"name": "Divergence-Anchor-OMEGA", "path": "Divergence-Anchor-OMEGA/SKILL.md", "action": "Sync the model's focus back to the Operator's hyperfocus using a divergence anchor to capture high-entropy ideas."}
        ]
    }
}

def load_memory():
    """Load persistent memory or initialize it if missing."""
    if MEMORY_PATH.exists():
        try:
            with open(MEMORY_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "conversations": {},
        "global_stats": {
            "bottlenecks_detected": 0,
            "suggestions_served": 0
        }
    }

def save_memory(memory):
    """Persist memory to disk."""
    SENTINEL_DIR.mkdir(parents=True, exist_ok=True)
    with open(MEMORY_PATH, "w", encoding="utf-8") as f:
        json.dump(memory, f, indent=2, ensure_ascii=False)

def calculate_jaccard_similarity(str1, str2):
    """Compute token Jaccard similarity for cognitive redundancy checks."""
    words1 = set(re.findall(r"\w+", str1.lower()))
    words2 = set(re.findall(r"\w+", str2.lower()))
    if not words1 or not words2:
        return 0.0
    return len(words1.intersection(words2)) / len(words1.union(words2))

def analyze_transcript(conv_id):
    """Analyze a single conversation transcript for bottleneck signatures."""
    transcript_path = BRAIN_DIR / conv_id / ".system_generated" / "logs" / "transcript.jsonl"
    if not transcript_path.exists():
        return None, "Transcript file not found."

    steps = []
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                steps.append(json.loads(line))
            except json.JSONDecodeError:
                continue

    if not steps:
        return None, "Empty transcript."

    # Diagnostics state
    detected_signatures = []
    diagnostic_info = {}

    # Extract command list, tool outcomes, file accesses, user queries, and model thoughts
    commands_run = []
    file_actions = []
    tool_failures = 0
    consecutive_failures = 0
    max_consecutive_failures = 0
    user_inputs = []
    model_thoughts = []

    for step in steps:
        step_type = step.get("type")
        source = step.get("source")
        status = step.get("status")
        content = step.get("content", "")

        # Trace Tool Calls
        tool_calls = step.get("tool_calls", [])
        if tool_calls:
            for tc in tool_calls:
                name = tc.get("name")
                args = tc.get("args", {})
                if name == "run_command" and "CommandLine" in args:
                    commands_run.append(args["CommandLine"])
                
                # File access monitoring
                if name in ["view_file", "replace_file_content", "multi_replace_file_content", "write_to_file"]:
                    file_path = args.get("AbsolutePath") or args.get("TargetFile")
                    if file_path:
                        file_actions.append((name, file_path))

        # Trace failures
        if status in ["ERROR", "FAILED"] or "Error:" in content:
            consecutive_failures += 1
            tool_failures += 1
            max_consecutive_failures = max(max_consecutive_failures, consecutive_failures)
        else:
            consecutive_failures = 0

        # Trace User Inputs
        if step_type == "USER_INPUT" and source == "USER_EXPLICIT":
            user_inputs.append(content)

        # Trace Model Thoughts
        thinking = step.get("thinking", "")
        if thinking:
            model_thoughts.append(thinking)
        elif step_type == "PLANNER_RESPONSE" and content:
            model_thoughts.append(content)

    # 1. SIG-CMD-STAG check (Command Stagnation)
    # Check if the same command is executed repeatedly in the last 8 commands
    recent_cmds = commands_run[-8:]
    for cmd in set(recent_cmds):
        if recent_cmds.count(cmd) >= 3:
            detected_signatures.append("SIG-CMD-STAG")
            diagnostic_info["SIG-CMD-STAG"] = f"Command '{cmd}' executed {recent_cmds.count(cmd)} times in the last steps."
            break

    # 2. SIG-TOOL-ERR check (Tool Failure Loop)
    if max_consecutive_failures >= 3:
        detected_signatures.append("SIG-TOOL-ERR")
        diagnostic_info["SIG-TOOL-ERR"] = f"A consecutive sequence of {max_consecutive_failures} tool failures was detected."

    # 3. SIG-CTX-FLAP check (Context Flapping)
    # Check if the same file is modified/viewed repeatedly in the last 10 actions
    recent_files = [path for _, path in file_actions[-10:]]
    for path in set(recent_files):
        if recent_files.count(path) >= 4:
            detected_signatures.append("SIG-CTX-FLAP")
            diagnostic_info["SIG-CTX-FLAP"] = f"File '{Path(path).name}' read/written {recent_files.count(path)} times in quick succession."
            break

    # 4. SIG-OP-FRUST check (Operator Frustration)
    frustration_pat = re.compile(r"\b(error|no funciona|bucle|atascado|no avanza|fallo|rompe|stuck|fail|loop)\b", re.IGNORECASE)
    recent_user_inputs = user_inputs[-3:]
    for i, ui in enumerate(recent_user_inputs):
        if frustration_pat.search(ui):
            detected_signatures.append("SIG-OP-FRUST")
            diagnostic_info["SIG-OP-FRUST"] = f"Frustration pattern matched in user input: '{ui[:60]}...'"
            break

    # 5. SIG-COG-SLOP check (Cognitive Redundancy)
    recent_thoughts = model_thoughts[-3:]
    if len(recent_thoughts) >= 3:
        sim1 = calculate_jaccard_similarity(recent_thoughts[-1], recent_thoughts[-2])
        sim2 = calculate_jaccard_similarity(recent_thoughts[-2], recent_thoughts[-3])
        if sim1 > 0.8 and sim2 > 0.8:
            detected_signatures.append("SIG-COG-SLOP")
            diagnostic_info["SIG-COG-SLOP"] = f"Model outputs exhibit high similarity (Jaccard: {sim1:.2f}, {sim2:.2f}) across consecutive turns."

    return detected_signatures, diagnostic_info

def generate_alert_markdown(signature, diagnostics, recommendation):
    """Generate beautiful Industrial Noir 2026 alert markdown."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines = [
        f"---",
        f"ArtifactMetadata:",
        f"  UserFacing: true",
        f"  Summary: Bottleneck alert generated by DIAMOND-Sentinel-Ω.",
        f"  RequestFeedback: false",
        f"---",
        f"",
        f"# 💎 BOTTLENECK DETECTED: {recommendation['title']}",
        f"",
        f"> **SYS_ID: DIAMOND_SENTINEL_OMEGA | STATE: C5-REAL | TIMESTAMP: {timestamp}**",
        f"",
        f"A stagnation signature **`{signature}`** has been registered in this session's telemetry.",
        f"",
        f"## 🔍 Diagnostic Trace",
        f"> [!WARNING]",
        f"> {diagnostics}",
        f"",
        f"## 💡 Recommended Mitigation Strategies",
        f"To break the current deadlock, we suggest clarifying or executing the following protocols/swarms:",
        f""
    ]

    for skill in recommendation["skills"]:
        skill_path = SKILLS_DIR / skill["path"]
        url = f"file://{skill_path}"
        lines.append(f"### ⚙️ [{skill['name']}]({url})")
        lines.append(f"- **Action Required**: {skill['action']}")
        lines.append(f"")

    lines.append("---")
    lines.append("## 🪞 Cognitive Context")
    lines.append("Use the slash commands `/honest-check` or `/grill-me` if the alignment remains broken.")
    lines.append("")
    return "\n".join(lines)

def run_once(conv_id):
    """Run a single JIT scan and output results."""
    memory = load_memory()
    sigs, info = analyze_transcript(conv_id)
    if sigs is None:
        print(f"[C5-REAL] Error: {info}")
        return

    if not sigs:
        print("[C5-REAL] Scan complete. Zero bottlenecks detected.")
        return

    print(f"[C5-REAL] Detected {len(sigs)} bottleneck signatures: {sigs}")
    
    # Process the first detected signature
    sig = sigs[0]
    rec = RECOMMENDATIONS[sig]
    diagnostics = info[sig]

    # Generate Alert
    alert_md = generate_alert_markdown(sig, diagnostics, rec)
    alert_path = BRAIN_DIR / conv_id / "diamond_sentinel_alert.md"
    
    # Save alert to the conversation artifacts
    with open(alert_path, "w", encoding="utf-8") as f:
        f.write(alert_md)
        
    print(f"[C5-REAL] Alert written successfully to: {alert_path}")

    # Save to memory
    conv_mem = memory["conversations"].setdefault(conv_id, {"history": []})
    conv_mem["history"].append({
        "timestamp": datetime.now().isoformat(),
        "signature": sig,
        "diagnostics": diagnostics
    })
    memory["global_stats"]["bottlenecks_detected"] += 1
    memory["global_stats"]["suggestions_served"] += 1
    save_memory(memory)

def daemon_mode(interval=5):
    """Monitor brain directory for modifications and analyze active session."""
    print(f"[C5-REAL] DIAMOND-SENTINEL-Ω DAEMON INITIATED.")
    print(f"[C5-REAL] Monitoring directory: {BRAIN_DIR}")
    print(f"[C5-REAL] Check interval: {interval}s")

    known_alerts = {}

    while True:
        try:
            sessions = []
            for d in BRAIN_DIR.iterdir():
                if d.is_dir():
                    transcript = d / ".system_generated" / "logs" / "transcript.jsonl"
                    if transcript.exists():
                        sessions.append((transcript.stat().st_mtime, d.name))
            
            if sessions:
                sessions.sort(reverse=True)
                latest_conv_id = sessions[0][1]
                
                # Analyze active session
                sigs, info = analyze_transcript(latest_conv_id)
                
                if sigs:
                    sig = sigs[0]
                    diagnostics = info[sig]
                    
                    # Prevent spamming the same signature alert in this conversation
                    alert_key = f"{latest_conv_id}:{sig}"
                    # Only alert if we haven't alerted in the last 30 seconds for this sig, or it's new
                    last_alert_time = known_alerts.get(alert_key, 0)
                    if time.time() - last_alert_time > 30:
                        print(f"\n[C5-REAL] WAKE: Bottleneck '{sig}' found in {latest_conv_id}.")
                        rec = RECOMMENDATIONS[sig]
                        alert_md = generate_alert_markdown(sig, diagnostics, rec)
                        alert_path = BRAIN_DIR / latest_conv_id / "diamond_sentinel_alert.md"
                        
                        with open(alert_path, "w", encoding="utf-8") as f:
                            f.write(alert_md)
                            
                        known_alerts[alert_key] = time.time()
                        
                        # Update persistent memory
                        memory = load_memory()
                        conv_mem = memory["conversations"].setdefault(latest_conv_id, {"history": []})
                        conv_mem["history"].append({
                            "timestamp": datetime.now().isoformat(),
                            "signature": sig,
                            "diagnostics": diagnostics
                        })
                        memory["global_stats"]["bottlenecks_detected"] += 1
                        memory["global_stats"]["suggestions_served"] += 1
                        save_memory(memory)
                        
                        print(f"[C5-REAL] Active Alert posted to {alert_path}")
                        
        except Exception as e:
            print(f"[C4-SIM] Daemon loop warning: {e}")
            
        time.sleep(interval)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--daemon":
        daemon_mode()
    elif len(sys.argv) > 1:
        run_once(sys.argv[1])
    else:
        # Default: auto-detect most recent conversation
        sessions = []
        if BRAIN_DIR.exists():
            for d in BRAIN_DIR.iterdir():
                if d.is_dir():
                    transcript = d / ".system_generated" / "logs" / "transcript.jsonl"
                    if transcript.exists():
                        sessions.append((transcript.stat().st_mtime, d.name))
        
        if sessions:
            sessions.sort(reverse=True)
            latest_id = sessions[0][1]
            print(f"[C5-REAL] Auto-detected active session: {latest_id}")
            run_once(latest_id)
        else:
            print("Usage: python3 diamond_sentinel.py <conversation_id> OR python3 diamond_sentinel.py --daemon")
            sys.exit(1)
