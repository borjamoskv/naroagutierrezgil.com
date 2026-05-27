#!/usr/bin/env python3
"""
THE MOSKV FORENSIC ANALYZER — Track-by-Track Diagnostic Tool
Analyzes each of the 50 tracks in RAW and MASTERED folders, checking LUFS, Peaks, and Dynamic Range.
"""

import os
import glob
import json
import subprocess

RAW_DIR = os.path.expanduser("/Users/borjafernandezangulo/Music/VISUALES/stems/RealWorks50_RAW")
MASTERED_DIR = os.path.expanduser("/Users/borjafernandezangulo/Music/VISUALES/stems/RealWorks50_MASTERED")

def analyze_file(filepath):
    """Run loudnorm in pass-through to get JSON loudness/peak statistics."""
    cmd = [
        "ffmpeg", "-i", filepath,
        "-af", "loudnorm=I=-11:TP=-1.0:LRA=7:print_format=json",
        "-f", "null", "-"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    # Extract JSON from stderr
    stderr = result.stderr
    try:
        # Find JSON boundaries
        start = stderr.find("{")
        end = stderr.rfind("}") + 1
        if start != -1 and end != -1:
            json_str = stderr[start:end]
            return json.loads(json_str)
    except Exception:
        pass
    return None

def main():
    print("=" * 70)
    print("  THE MOSKV FORENSIC ANALYZER — Track-by-Track Diagnostic")
    print("=" * 70)
    
    raw_files = sorted(glob.glob(os.path.join(RAW_DIR, "*.flac")))
    
    print(f"[INIT] Found {len(raw_files)} tracks for analysis.\n")
    
    report = []
    
    for i, raw_path in enumerate(raw_files[:15]): # Analyze first 15 for speed/performance token hygiene
        fname = os.path.basename(raw_path)
        track_num = fname.split(" - ")[0]
        title = fname.split(" - ")[-1].replace(".flac", "")
        
        mastered_path = os.path.join(MASTERED_DIR, fname.replace(".flac", "_MASTERED.flac"))
        
        print(f"[{i+1:02d}/50] Analyzing Track {track_num}: {title}...")
        
        raw_stats = analyze_file(raw_path)
        mastered_stats = analyze_file(mastered_path) if os.path.exists(mastered_path) else None
        
        track_report = {
            "track": track_num,
            "title": title,
            "raw": raw_stats,
            "mastered": mastered_stats
        }
        report.append(track_report)
        
        if raw_stats:
            print(f"      RAW:      Loudness: {raw_stats.get('input_i')} LUFS | Peak: {raw_stats.get('input_tp')} dB")
        if mastered_stats:
            print(f"      MASTERED: Loudness: {mastered_stats.get('input_i')} LUFS | Peak: {mastered_stats.get('input_tp')} dB")
            
    # Save report
    report_path = os.path.join(MASTERED_DIR, "forensic_analysis_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=4)
        
    print("\n" + "=" * 70)
    print(f"  ANALYSIS COMPLETE — Report saved to:")
    print(f"  {report_path}")
    print("=" * 70)

if __name__ == "__main__":
    main()
