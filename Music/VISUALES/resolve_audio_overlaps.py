import re
import sys
from pathlib import Path
import json

def parse_report(report_path: Path):
    content = report_path.read_text(encoding="utf-8")
    blocks = re.split(r'\nTrack: ', '\n' + content)[1:]
    
    resolved = {}
    total_conflicts = 0
    total_resolved = 0
    
    for block in blocks:
        lines = block.strip().split('\n')
        track_name = lines[0].strip()
        
        matches = []
        for line in lines[1:]:
            #   1. Start: 8567.98s | End: 8880.05s | Score: 0.6045 | Overlaps with: 019 - Borja Mos, 045 - Borja Mos
            m = re.match(r'\s*\d+\.\s*Start:\s*([\d\.]+)s\s*\|\s*End:\s*([\d\.]+)s\s*\|\s*Score:\s*([\d\.]+)\s*\|\s*Overlaps with:\s*(.*)', line)
            if m:
                matches.append({
                    "start": float(m.group(1)),
                    "end": float(m.group(2)),
                    "score": float(m.group(3)),
                    "overlaps": [x.strip() for x in m.group(4).split(',')]
                })
        
        if matches:
            total_conflicts += 1
            # RESOLUTION LOGIC: Keep the match with the HIGHEST score (REMOTE equivalent)
            best_match = max(matches, key=lambda x: x["score"])
            resolved[track_name] = best_match
            total_resolved += 1
            print(f"[FIX] {track_name} — Resolved to Start: {best_match['start']}s (Score: {best_match['score']})")

    print(f"\nRESOLVED: {total_resolved} conflicts across {total_conflicts} tracks")
    
    output_path = report_path.parent / "resolved_audio_ledger.json"
    output_path.write_text(json.dumps(resolved, indent=2), encoding="utf-8")
    print(f"[LEDGER] Resolution matrix saved to: {output_path}")

def main():
    report_file = Path("unresolved_report.txt")
    if not report_file.exists():
        print(f"Error: {report_file.absolute()} not found.")
        sys.exit(1)
        
    parse_report(report_file)

if __name__ == "__main__":
    main()
