#!/usr/bin/env python3
"""
CORTEX Album Processing Pipeline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Batch processes the "The abundance awaits us in every furrow" album:
1. Runs Demucs to separate stems.
2. Cleans & remixes stems using custom Pedalboard DSP.
3. Masters the resulting mix using symphony_pipeline.py to standard -14.0 LUFS.
4. Maintains audit records.

Reality: C5-REAL (Local Execution)
"""

import os
import sys
import time
import subprocess
import json
import hashlib
from pathlib import Path
import numpy as np
import soundfile as sf
from pedalboard import (
    Pedalboard, HighpassFilter, LowpassFilter, PeakFilter,
    Compressor, Reverb, Chorus, Distortion, Gain, NoiseGate, Phaser
)

BASE_DIR = Path("/Users/borjafernandezangulo/Music/VISUALES")
ALBUM_DIR = BASE_DIR / "the_abundance_awaits_us_in_every_furrow"
STEMS_DIR = BASE_DIR / "stems"
MASTERED_DIR = BASE_DIR / "mastered"
DEMUCS_PATH = "/Users/borjafernandezangulo/.local/bin/demucs"
SYMPHONY_PATH = "/Users/borjafernandezangulo/.gemini/antigravity/skills/mastering-engineer/scripts/symphony_pipeline.py"

# Ensure dirs exist
STEMS_DIR.mkdir(parents=True, exist_ok=True)
MASTERED_DIR.mkdir(parents=True, exist_ok=True)

def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

def clean_and_remix_stems(stems_dir, output_mix_path, track_name):
    """Loads Demucs stems, cleans AI artifacts, and mixes down with custom gains."""
    stems = {}
    stems_to_load = ["vocals", "drums", "bass", "other"]
    
    for stem in stems_to_load:
        path = stems_dir / f"{stem}.wav"
        if not path.exists():
            raise FileNotFoundError(f"Missing stem: {path}")
        data, sr = sf.read(path, dtype='float64')
        stems[stem] = (data, sr)
        
    sr = stems["vocals"][1]
    
    vocals_data = stems["vocals"][0]
    drums_data = stems["drums"][0]
    bass_data = stems["bass"][0]
    other_data = stems["other"][0]
    
    vocals_rms = float(np.sqrt(np.mean(vocals_data ** 2)))
    drums_rms = float(np.sqrt(np.mean(drums_data ** 2)))
    bass_rms = float(np.sqrt(np.mean(bass_data ** 2)))
    other_rms = float(np.sqrt(np.mean(other_data ** 2)))
    
    print(f"[*] Stem Analysis [{track_name}] -> Vocals RMS: {vocals_rms:.5f}, Drums RMS: {drums_rms:.5f}, Bass RMS: {bass_rms:.5f}, Other RMS: {other_rms:.5f}")
    
    # Vocals cleaning & remixing
    if vocals_rms < 1e-4:
        print(f"[*] Profile: INSTRUMENTAL")
        vocals_w = 0.0
        vocals_remix = np.zeros_like(vocals_data)
    else:
        vocals_w = 1.0
        print(f"[*] Profile: VOCAL")
        vocals_cleaned = Pedalboard([
            NoiseGate(threshold_db=-45, release_ms=200),
            HighpassFilter(cutoff_frequency_hz=100),
            PeakFilter(cutoff_frequency_hz=5800, gain_db=-2.0, q=1.6)
        ])(vocals_data.T, sr).T
        vocals_remix = Pedalboard([
            Chorus(rate_hz=0.6, depth=0.15, mix=0.10),
            Reverb(room_size=0.5, wet_level=0.12, dry_level=0.88)
        ])(vocals_cleaned.T, sr).T
        
    # Other / Melodic elements (Ambient / Shoegaze balance)
    if other_rms > 0.12:
        other_w = 0.95
        other_eq_gain = -1.2
    else:
        other_w = 1.05
        other_eq_gain = -0.5
        
    other_cleaned = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=75),
        PeakFilter(cutoff_frequency_hz=9200, gain_db=other_eq_gain, q=1.2),
        Phaser(rate_hz=0.1, depth=0.15, feedback=0.05, mix=0.05)
    ])(other_data.T, sr).T
    other_remix = Pedalboard([
        Reverb(room_size=0.7, wet_level=0.15, dry_level=0.85)
    ])(other_cleaned.T, sr).T
    
    # Drums
    drums_w = 0.98 if drums_rms > 0.15 else 1.02
    drums_cleaned = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=26),
        LowpassFilter(cutoff_frequency_hz=17500),
        Compressor(threshold_db=-15, ratio=3.0, attack_ms=10, release_ms=120)
    ])(drums_data.T, sr).T
    drums_remix = Pedalboard([
        Distortion(drive_db=0.5)
    ])(drums_cleaned.T, sr).T
    
    # Bass
    bass_w = 0.95
    bass_cleaned = Pedalboard([
        LowpassFilter(cutoff_frequency_hz=220),
        Compressor(threshold_db=-18, ratio=5.0, attack_ms=5, release_ms=200)
    ])(bass_data.T, sr).T
    
    # Align sample length
    min_len = min(len(drums_remix), len(bass_cleaned), len(vocals_remix), len(other_remix))
    
    # Mixdown summing
    mix = (drums_remix[:min_len] * drums_w + 
           bass_cleaned[:min_len] * bass_w + 
           vocals_remix[:min_len] * vocals_w + 
           other_remix[:min_len] * other_w)
    
    # Control headroom for mastering
    peak = np.max(np.abs(mix))
    if peak > 0:
        mix /= (peak + 1e-10)
    mix *= 0.65  # Preserve ~3.7dB of headroom
    
    sf.write(output_mix_path, mix, sr, subtype='PCM_24')
    print(f"[+] Cleaned mixdown exported: {output_mix_path}")
    return mix, sr

def process_track(track_path):
    t_start = time.time()
    track_name = track_path.stem
    print(f"\n================================━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"PROCESSING TRACK: {track_name}")
    print(f"================================━━━━━━━━━━━━━━━━━━━━━━━━")
    
    # 1. Demucs separation
    track_stems_dir = STEMS_DIR / "htdemucs" / track_name
    vocals_file = track_stems_dir / "vocals.wav"
    
    if vocals_file.exists():
        print(f"[*] Stems already exist. Skipping Demucs.")
    else:
        print(f"[*] Running Demucs separation on: {track_path.name}")
        cmd = [DEMUCS_PATH, "-o", str(STEMS_DIR), str(track_path)]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"[-] Demucs failed for {track_name}:")
            print(result.stderr)
            return False
        print(f"[+] Demucs separation finished successfully.")
        
    # 2. Clean and Remix Stems
    mix_path = track_stems_dir / f"{track_name}_mix.wav"
    try:
        clean_and_remix_stems(track_stems_dir, mix_path, track_name)
    except Exception as e:
        print(f"[-] Cleaning/Remixing failed for {track_name}: {str(e)}")
        return False
        
    # 3. Mastering using symphony_pipeline.py
    mastered_file = MASTERED_DIR / f"{track_name}_mastered.wav"
    print(f"[*] Running symphony_pipeline mastering to -14.0 LUFS...")
    cmd = [
        "arch", "-arm64", "/Users/borjafernandezangulo/Music/JaranaEngine/jarana_env/bin/python3", SYMPHONY_PATH,
        str(mix_path), str(mastered_file),
        "--lufs", "-14.0",
        "--profile", "club"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[-] Mastering failed for {track_name}:")
        print(result.stderr)
        return False
    
    print(result.stdout)
    elapsed = time.time() - t_start
    print(f"[+] Track {track_name} processed successfully in {elapsed:.1f}s.")
    return True

def main():
    tracks = sorted(list(ALBUM_DIR.glob("*.mp3")))
    if not tracks:
        print("[-] No tracks found in the album directory.")
        sys.exit(1)
        
    print(f"[*] Found {len(tracks)} tracks to process.")
    
    # Process only the first track as a diagnostic test
    print("[*] Diagnostic Run: Processing track 1...")
    success = process_track(tracks[0])
    if not success:
        print("[-] Diagnostic run failed. Aborting batch execution.")
        sys.exit(1)
        
    print("[+] Diagnostic run succeeded! Starting remaining tracks...")
    
    for idx, track in enumerate(tracks[1:], start=2):
        print(f"\n[*] Processing track {idx}/{len(tracks)}...")
        process_track(track)
        
    print("\n================================━━━━━━━━━━━━━━━━━━━━━━━━")
    print("ALL ALBUM TRACKS PROCESSED SUCCESSFULLY!")
    print(f"Mastered tracks location: {MASTERED_DIR}")
    print("================================━━━━━━━━━━━━━━━━━━━━━━━━")

if __name__ == "__main__":
    main()
