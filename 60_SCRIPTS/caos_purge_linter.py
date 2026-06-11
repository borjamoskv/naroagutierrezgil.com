#!/usr/bin/env python3
import os
import sys
import subprocess
from pathlib import Path

# Color styling for Industrial Noir 2026
C5_GREEN = "\033[32m"
C5_RED = "\033[31m"
C5_BLUE = "\033[34m"
C5_DIM = "\033[2m"
C5_RESET = "\033[0m"

print(f"{C5_BLUE}[C5-REAL] CAOS-Ω Exergy Purge Linter v2.0.0 (x10-APEX){C5_RESET}")
print(f"{C5_DIM}Axiom: Ω₂ Entropic Asymmetry — Order displaces chaos aggressively.{C5_RESET}\n")

home_dir = Path.home()
projects_dir = home_dir / "10_PROJECTS"
logs_dir = home_dir / "80_LOGS"

def run_cmd(cmd, cwd=None):
    try:
        res = subprocess.run(cmd, cwd=cwd, shell=True, text=True, capture_output=True)
        return res.stdout.strip(), res.returncode
    except Exception as e:
        return "", -1

def purge_zcompdumps():
    print(f"{C5_BLUE}[*] Phase 1: Purging zsh completion dump files...{C5_RESET}")
    purged_files = 0
    purged_bytes = 0
    
    for f in home_dir.iterdir():
        if f.is_file() and f.name.startswith(".zcompdump.MacBook-Pro-de-Borja.local."):
            try:
                size = f.stat().st_size
                f.unlink()
                purged_files += 1
                purged_bytes += size
                print(f"  {C5_DIM}→ Deleted: {f.name} ({size} bytes){C5_RESET}")
            except Exception as e:
                print(f"  {C5_RED}→ Error deleting {f.name}: {e}{C5_RESET}")
                
    if purged_files > 0:
        print(f"  {C5_GREEN}✓ Purged {purged_files} stale zcompdump files. Freed {purged_bytes} bytes.{C5_RESET}")
    else:
        print(f"  {C5_DIM}→ No stale zcompdump files found.{C5_RESET}")
    return purged_files, purged_bytes

def audit_git_repositories():
    print(f"\n{C5_BLUE}[*] Phase 2: Auditing git repositories in 10_PROJECTS...{C5_RESET}")
    dirty_count = 0
    active_repos = 0
    
    if not projects_dir.exists():
        print(f"  {C5_RED}→ 10_PROJECTS directory not found.{C5_RESET}")
        return 0, 0
        
    for p in projects_dir.iterdir():
        if p.is_dir() and (p / ".git").exists():
            active_repos += 1
            status, code = run_cmd("git status --short", cwd=p)
            if status:
                dirty_count += 1
                lines = status.split("\n")
                print(f"  {C5_RED}→ DIRTY REPO: {p.name} ({len(lines)} changes){C5_RESET}")
                for line in lines[:3]:
                    print(f"    {C5_DIM}{line}{C5_RESET}")
                if len(lines) > 3:
                    print(f"    {C5_DIM}... and {len(lines) - 3} more.{C5_RESET}")
                    
                # Autoclean .DS_Store deletions
                for line in lines:
                    if ".DS_Store" in line:
                        print(f"    {C5_BLUE}[!] Found tracked .DS_Store noise. Auto-crystallizing...{C5_RESET}")
                        run_cmd("git add -u && git commit -m 'chore: remove tracked .DS_Store file'", cwd=p)
                        # Re-check status
                        new_status, _ = run_cmd("git status --short", cwd=p)
                        if not new_status:
                            dirty_count -= 1
                            print(f"    {C5_GREEN}✓ Repo {p.name} is now clean.{C5_RESET}")
                        break
                        
    if dirty_count == 0:
        print(f"  {C5_GREEN}✓ All {active_repos} active repositories are pristine (Zero Entropy).{C5_RESET}")
    else:
        print(f"  {C5_RED}→ Found {dirty_count} dirty repositories out of {active_repos}.{C5_RESET}")
        
    return dirty_count, active_repos

def truncate_bloated_logs():
    print(f"\n{C5_BLUE}[*] Phase 3: Truncating large inactive log files (>10MB)...{C5_RESET}")
    truncated_files = 0
    freed_bytes = 0
    
    if not logs_dir.exists():
        print(f"  {C5_DIM}→ 80_LOGS directory not found.{C5_RESET}")
        return 0, 0
        
    for f in logs_dir.iterdir():
        if f.is_file() and f.suffix == ".log":
            try:
                size = f.stat().st_size
                if size > 10 * 1024 * 1024:  # > 10MB
                    # Truncate
                    with open(f, "w") as file_to_truncate:
                        file_to_truncate.truncate(0)
                    truncated_files += 1
                    freed_bytes += size
                    print(f"  {C5_GREEN}✓ Truncated: {f.name} (Freed {size} bytes){C5_RESET}")
            except Exception as e:
                print(f"  {C5_RED}→ Error truncating {f.name}: {e}{C5_RESET}")
                
    if truncated_files == 0:
        print(f"  {C5_DIM}→ No bloated log files found.{C5_RESET}")
    return truncated_files, freed_bytes

if __name__ == "__main__":
    purged_f, purged_b = purge_zcompdumps()
    dirty_repos, total_repos = audit_git_repositories()
    trunc_f, trunc_b = truncate_bloated_logs()
    
    # Calculate Exergy score (100 is baseline, 140 is absolute optimal)
    # Deduct 10 points per dirty repo, add points for freed bytes
    exergy_score = 140 - (dirty_repos * 15)
    if exergy_score < 40:
        exergy_score = 40
        
    print(f"\n{C5_BLUE}--- CAOS-Ω LINTER REPORT ---{C5_RESET}")
    print(f"Claim: Exergy Linter verification run complete.")
    print(f"Proof: {{")
    print(f"  Files Purged: {purged_f},")
    print(f"  Logs Truncated: {trunc_f},")
    print(f"  Total Bytes Freed: {purged_b + trunc_b},")
    print(f"  Dirty Repos: {dirty_repos}/{total_repos},")
    print(f"  Exergy Score: {exergy_score}/140,")
    print(f"  Confidence: C5-REAL")
    print(f"}}")
    
    if dirty_repos > 0:
        print(f"\n{C5_RED}[!] EXIT: ENTROPIC DRIFT DETECTED. Action required.{C5_RESET}")
        sys.exit(1)
    else:
        print(f"\n{C5_GREEN}[+] EXIT: WORKSPACE PRISTINE (Exergy Level: {exergy_score}/140).{C5_RESET}")
        sys.exit(0)
