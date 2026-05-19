#!/usr/bin/env python3
"""
CORTEX Sovereign Parallel Audio Swarm v3.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Orchestrates 23 parallel agents (threads) to:
1. Separate audio into stems using Demucs (with throttling to protect hardware)
2. Clean AI artifacts (phasing, bleed, watery fizz) using custom Pedalboard DSP
3. Apply creative stem remixing (compression, reverb, spacing, glue)
4. Execute professional 12-stage mastering (LUFS target, Mid/Side EQ, limiter, dither)
5. Generate before/after spectrogram and transaction ledger

Reality: C5-REAL (Local DSP Execution)
"""

import os
import sys
import time
import json
import hashlib
import threading
import subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import soundfile as sf
from scipy import signal
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from pedalboard import (
    Pedalboard, HighpassFilter, LowpassFilter, PeakFilter,
    HighShelfFilter, LowShelfFilter, Compressor, Limiter,
    Reverb, Chorus, Distortion, Gain, NoiseGate, Phaser
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PATH CONFIGURATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BASE_DIR = Path("/Users/borjafernandezangulo/Music/VISUALES/cactuses-2")
DOWNLOADS_DIR = BASE_DIR / "downloads"
SEPARATED_DIR = BASE_DIR / "separated"
CLEANED_DIR = BASE_DIR / "cleaned"
REMIXED_DIR = BASE_DIR / "remixed"
MASTERED_DIR = BASE_DIR / "mastered"

# Ensure folders exist
for folder in [SEPARATED_DIR, CLEANED_DIR, REMIXED_DIR, MASTERED_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

# Hardware protection: Demucs uses high CPU/RAM, throttle to 2 parallel tasks
DEMUCS_SEMAPHORE = threading.Semaphore(2)

# Mastering presets
MASTER_PRESET = {
    "target_lufs": -11.0,  # Loud modern stream standard
    "ceiling_db": -0.8,
    "hp_hz": 25.0,
    "eq_mid": {
        "low_shelf": (75, 1.2),
        "mud_cut": (310, -2.0, 1.2),
        "presence": (3500, 1.8, 1.5),
        "air": (11500, 2.0),
    },
    "eq_side": {
        "low_cut_hz": 130,
        "air": (10000, 2.5),
    },
    "multiband": {
        "low": {"freq": 200, "thresh": -16, "ratio": 3.5, "attack": 20, "release": 180},
        "mid": {"freq": 4000, "thresh": -14, "ratio": 3.5, "attack": 10, "release": 130},
        "high": {"thresh": -12, "ratio": 2.5, "attack": 5, "release": 90},
    },
    "deess": {"freq": 6500, "thresh": -14, "ratio": 4.5},
    "exciter": {"odd": 0.12, "even": 0.08, "mix": 0.18},
    "saturation": {"drive": 2.2, "mix": 0.25},
    "stereo_width": 1.10,
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DSP UTILITY FUNCTIONS (No pyloudnorm dependency)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

def k_weight_filter(sr):
    """ITU-R BS.1770-4 K-weighting filters: high shelf + high pass."""
    # Stage 1: High shelf (+4dB @ ~1500Hz)
    f0 = 1681.974450955533
    Q = 0.7071752369554196
    K = np.tan(np.pi * f0 / sr)
    Vh = 10 ** (4.0 / 20.0)
    Vb = Vh ** 0.4996667741545416
    a0 = 1.0 + K / Q + K * K
    b = np.array([
        (Vh + Vb * K / Q + K * K) / a0,
        2.0 * (K * K - Vh) / a0,
        (Vh - Vb * K / Q + K * K) / a0,
    ])
    a = np.array([1.0, 2.0 * (K * K - 1.0) / a0, (1.0 - K / Q + K * K) / a0])

    # Stage 2: Highpass (RLB weighting)
    f1 = 38.13547087602444
    Q1 = 0.5003270373238773
    K1 = np.tan(np.pi * f1 / sr)
    a01 = 1.0 + K1 / Q1 + K1 * K1
    b2 = np.array([1.0 / a01, -2.0 / a01, 1.0 / a01])
    a2 = np.array([1.0, 2.0 * (K1 * K1 - 1.0) / a01, (1.0 - K1 / Q1 + K1 * K1) / a01])
    return (b, a), (b2, a2)

def measure_lufs(audio, sr):
    """ITU-R BS.1770-4 integrated LUFS loudness measurement."""
    (b1, a1), (b2, a2) = k_weight_filter(sr)
    channels = []
    
    # Handle both stereo (N, 2) and mono (N,)
    if audio.ndim == 1:
        audio = audio.reshape(-1, 1)
        
    for ch in range(audio.shape[1]):
        x = signal.lfilter(b1, a1, audio[:, ch])
        x = signal.lfilter(b2, a2, x)
        channels.append(x)

    block_size = int(0.4 * sr)  # 400ms blocks
    step = int(0.1 * sr)        # 100ms step (75% overlap)
    block_powers = []
    
    for start in range(0, len(channels[0]) - block_size, step):
        power = 0.0
        for ch in channels:
            block = ch[start:start + block_size]
            power += np.mean(block ** 2)
        block_powers.append(power)

    if not block_powers:
        return -70.0

    block_powers = np.array(block_powers)
    # Absolute gate threshold: -70 LUFS
    abs_thresh = 10 ** ((-70 + 0.691) / 10.0)
    gated = block_powers[block_powers > abs_thresh]
    if len(gated) == 0:
        return -70.0

    # Relative gate threshold: -10 dB below average
    mean_g = np.mean(gated)
    rel_thresh = mean_g * 10 ** (-10.0 / 10.0)
    final = gated[gated > rel_thresh]
    if len(final) == 0:
        return -70.0

    return -0.691 + 10.0 * np.log10(np.mean(final))

def true_peak_dbtp(audio, sr):
    """Measures inter-sample true peak using 4x oversampling."""
    if audio.ndim == 1:
        audio = audio.reshape(-1, 1)
    peaks = []
    for ch in range(audio.shape[1]):
        up = signal.resample_poly(audio[:, ch], 4, 1)
        peaks.append(np.max(np.abs(up)))
    tp = max(peaks)
    return 20 * np.log10(tp + 1e-10)

def analyze_audio(audio, sr):
    peak = np.max(np.abs(audio))
    rms = np.sqrt(np.mean(audio ** 2))
    lufs = measure_lufs(audio, sr)
    tp = true_peak_dbtp(audio, sr)
    return {
        "peak_db": round(20 * np.log10(peak + 1e-10), 2),
        "rms_db": round(20 * np.log10(rms + 1e-10), 2),
        "lufs": round(lufs, 2),
        "true_peak_dbtp": round(tp, 2),
        "crest_db": round(20 * np.log10(peak + 1e-10) - 20 * np.log10(rms + 1e-10), 2),
        "dc_offset": round(float(np.mean(audio)), 7),
    }

def to_ms(audio):
    """Converts Stereo to Mid/Side."""
    mid = (audio[:, 0] + audio[:, 1]) / 2.0
    side = (audio[:, 0] - audio[:, 1]) / 2.0
    return mid, side

def from_ms(mid, side):
    """Converts Mid/Side back to Stereo."""
    return np.column_stack([mid + side, mid - side])

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CORE PIPELINE PROCESSES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def clean_and_remix_stems(stems_dir, output_mix_path, sr_target=44100):
    """Loads 4 Demucs stems, cleans AI frequencies, and remixes them."""
    # 1. Load stems
    stems = {}
    stems_to_load = ["vocals", "drums", "bass", "other"]
    
    for stem in stems_to_load:
        path = stems_dir / f"{stem}.wav"
        if not path.exists():
            raise FileNotFoundError(f"Missing stem: {path}")
        data, sr = sf.read(path, dtype='float64')
        stems[stem] = (data, sr)
        
    sr = stems["vocals"][1]
    
    # 2. DSP Cleaning of AI Artifacts
    # Vocals: Gate out silence bleed, HPF low rumble, notch vocal resonances
    vocals_data = stems["vocals"][0]
    vocals_cleaned = Pedalboard([
        NoiseGate(threshold_db=-42, release_ms=180),
        HighpassFilter(cutoff_frequency_hz=110),
        PeakFilter(cutoff_frequency_hz=5800, gain_db=-2.5, q=1.6)
    ])(vocals_data.T, sr).T
    
    # Drums: Protect transient punch, high-cut watery aliasing
    drums_data = stems["drums"][0]
    drums_cleaned = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=28),
        LowpassFilter(cutoff_frequency_hz=16500),
        Compressor(threshold_db=-14, ratio=3.5, attack_ms=8, release_ms=100),
        Gain(gain_db=1.2)
    ])(drums_data.T, sr).T
    
    # Bass: Dynamic brickwall, strict lowpass to cut high bleeding
    bass_data = stems["bass"][0]
    bass_cleaned = Pedalboard([
        LowpassFilter(cutoff_frequency_hz=250),
        Compressor(threshold_db=-18, ratio=6.0, attack_ms=4, release_ms=220),
        Gain(gain_db=0.8)
    ])(bass_data.T, sr).T
    
    # Other: Spatial widening, HPF, notch watery artifacts (8k-10k)
    other_data = stems["other"][0]
    other_cleaned = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=140),
        PeakFilter(cutoff_frequency_hz=9200, gain_db=-3.5, q=1.2),
        HighShelfFilter(cutoff_frequency_hz=12500, gain_db=-1.5),
        Phaser(rate_hz=0.15, depth=0.25, feedback=0.1, mix=0.10)
    ])(other_data.T, sr).T
    
    # Export cleaned stems if needed (for transparency)
    cleaned_stems_dir = CLEANED_DIR / stems_dir.name
    cleaned_stems_dir.mkdir(exist_ok=True, parents=True)
    for stem_name, data in [("vocals", vocals_cleaned), ("drums", drums_cleaned), 
                            ("bass", bass_cleaned), ("other", other_cleaned)]:
        sf.write(cleaned_stems_dir / f"{stem_name}.wav", data, sr, subtype='PCM_24')

    # 3. Creative Remixing & Spacing
    drums_remix = Pedalboard([
        Distortion(drive_db=1.0)
    ])(drums_cleaned.T, sr).T
    
    vocals_remix = Pedalboard([
        Chorus(rate_hz=0.7, depth=0.12, mix=0.08),
        Reverb(room_size=0.45, wet_level=0.12, dry_level=0.88)
    ])(vocals_cleaned.T, sr).T
    
    other_remix = Pedalboard([
        Reverb(room_size=0.75, wet_level=0.18, dry_level=0.82)
    ])(other_cleaned.T, sr).T
    
    # Align sample length
    min_len = min(len(drums_remix), len(bass_cleaned), len(vocals_remix), len(other_remix))
    
    # Mixdown summing with gain balancing
    # Kick & Bass hold the core; Vocals stay clear; Atmosphere supports
    drums_w = 1.05
    bass_w = 0.95
    vocals_w = 0.90
    other_w = 0.85
    
    mix = (drums_remix[:min_len] * drums_w + 
           bass_cleaned[:min_len] * bass_w + 
           vocals_remix[:min_len] * vocals_w + 
           other_remix[:min_len] * other_w)
    
    # Headroom control for mastering
    peak = np.max(np.abs(mix))
    if peak > 0:
        mix /= (peak + 1e-10)
    mix *= 0.65  # Preserve 3.7dB of headroom
    
    sf.write(output_mix_path, mix, sr, subtype='PCM_24')
    return mix, sr


def master_audio(input_mix_path, output_master_path, preset):
    """Executes the 12-stage professional mastering chain."""
    P = preset
    audio, sr = sf.read(input_mix_path, dtype='float64')
    original = audio.copy()
    pre_stats = analyze_audio(audio, sr)
    
    # Stage 1: DC offset removal
    audio -= np.mean(audio, axis=0)
    
    # Stage 2: HP filter for sub-bass clean
    audio = Pedalboard([HighpassFilter(cutoff_frequency_hz=P['hp_hz'])])(audio.T, sr).T
    
    # Stage 3: Mid/Side Equalization
    mid, side = to_ms(audio)
    
    eq_m = P['eq_mid']
    mid_board = Pedalboard([
        LowShelfFilter(cutoff_frequency_hz=eq_m['low_shelf'][0], gain_db=eq_m['low_shelf'][1]),
        PeakFilter(cutoff_frequency_hz=eq_m['mud_cut'][0], gain_db=eq_m['mud_cut'][1], q=eq_m['mud_cut'][2]),
        PeakFilter(cutoff_frequency_hz=eq_m['presence'][0], gain_db=eq_m['presence'][1], q=eq_m['presence'][2]),
        HighShelfFilter(cutoff_frequency_hz=eq_m['air'][0], gain_db=eq_m['air'][1]),
    ])
    mid = mid_board(mid.reshape(1, -1), sr).flatten()
    
    eq_s = P['eq_side']
    side_board = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=eq_s['low_cut_hz']),
        HighShelfFilter(cutoff_frequency_hz=eq_s['air'][0], gain_db=eq_s['air'][1]),
    ])
    side = side_board(side.reshape(1, -1), sr).flatten()
    
    audio = from_ms(mid, side)
    
    # Stage 4: Dynamic De-esser (Surgical sibilant compression)
    # Bandpass filter around sibilants
    bp = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=P['deess']['freq'] * 0.75),
        LowpassFilter(cutoff_frequency_hz=P['deess']['freq'] * 1.3)
    ])
    at = audio.T
    sibs = bp(at, sr)
    sibs_comp = Pedalboard([
        Compressor(threshold_db=P['deess']['thresh'], ratio=P['deess']['ratio'], attack_ms=1.0, release_ms=45.0)
    ])(sibs, sr)
    audio = (at - sibs + sibs_comp).T
    
    # Stage 5: Linkwitz-Riley 3-Band Multiband Compression
    lo_freq = P['multiband']['low']['freq']
    hi_freq = P['multiband']['mid']['freq']
    
    lp = Pedalboard([LowpassFilter(cutoff_frequency_hz=lo_freq)])
    hp1 = Pedalboard([HighpassFilter(cutoff_frequency_hz=lo_freq)])
    lp2 = Pedalboard([LowpassFilter(cutoff_frequency_hz=hi_freq)])
    hp2 = Pedalboard([HighpassFilter(cutoff_frequency_hz=hi_freq)])
    
    at = audio.T
    low_band = lp(at, sr)
    rest_band = hp1(at, sr)
    mid_band = lp2(rest_band, sr)
    high_band = hp2(rest_band, sr)
    
    for band, key in [(low_band, 'low'), (mid_band, 'mid'), (high_band, 'high')]:
        cfg = P['multiband'][key]
        comp = Pedalboard([
            Compressor(threshold_db=cfg['thresh'], ratio=cfg['ratio'], attack_ms=cfg['attack'], release_ms=cfg['release'])
        ])
        band[:] = comp(band, sr)
        
    audio = (low_band + mid_band + high_band).T
    
    # Stage 6: Auto makeup gain matching original RMS
    orig_rms = np.sqrt(np.mean(original ** 2))
    post_rms = np.sqrt(np.mean(audio ** 2))
    if post_rms > 1e-10:
        audio *= orig_rms / post_rms
        
    # Stage 7: Chebyshev harmonic exciter (Warmth generation)
    odd_amt = P['exciter']['odd']
    even_amt = P['exciter']['even']
    mix_amt = P['exciter']['mix']
    x = audio.copy()
    odd_harmonics = 4 * x**3 - 3 * x
    even_harmonics = 2 * x**2 - 1
    even_harmonics -= np.mean(even_harmonics, axis=0) # remove DC
    harmonics = odd_harmonics * odd_amt + even_harmonics * even_amt
    audio = audio * (1 - mix_amt) + (audio + harmonics) * mix_amt
    
    # Stage 8: Tape Saturation
    drive_gain = 10 ** (P['saturation']['drive'] / 20.0)
    driven = audio * drive_gain
    sat = np.tanh(driven + 0.08 * driven**2)
    sat /= np.max(np.abs(sat) + 1e-10)
    sat *= np.max(np.abs(audio) + 1e-10)
    audio = audio * (1 - P['saturation']['mix']) + sat * P['saturation']['mix']
    
    # Stage 9: Stereo Width Widening
    mid, side = to_ms(audio)
    side *= P['stereo_width']
    audio = from_ms(mid, side)
    
    # Stage 10: LUFS Normalization
    current_lufs = measure_lufs(audio, sr)
    if current_lufs > -60:
        gain_db = P['target_lufs'] - current_lufs
        audio *= 10 ** (gain_db / 20.0)
        
    # Stage 11: True-Peak-Safe Brickwall Limiting (Convergent feedback loop)
    ceiling = P['ceiling_db']
    target_lufs = P['target_lufs']
    
    for i in range(8):
        curr_l = measure_lufs(audio, sr)
        diff = target_lufs - curr_l
        if abs(diff) > 0.05:
            audio *= 10 ** (diff / 20.0)
            
        lim = Pedalboard([Limiter(threshold_db=ceiling - 0.1)])
        audio = lim(audio.T, sr).T
        
        tp = true_peak_dbtp(audio, sr)
        if tp > ceiling:
            reduction = tp - ceiling + 0.02
            audio *= 10 ** (-reduction / 20.0)
            
        final_check = measure_lufs(audio, sr)
        if abs(final_check - target_lufs) < 0.1:
            break
            
    # Stage 12: 24-bit TPDF Dither
    q = 1.0 / (2 ** (24 - 1))
    n1 = np.random.uniform(-0.5, 0.5, audio.shape)
    n2 = np.random.uniform(-0.5, 0.5, audio.shape)
    audio = audio + (n1 + n2) * q
    audio = np.clip(audio, -1.0, 1.0)
    
    sf.write(output_master_path, audio, sr, subtype='PCM_24')
    post_stats = analyze_audio(audio, sr)
    
    return post_stats, pre_stats, original, audio

def generate_spec_plot(original, mastered, sr, output_img_path):
    fig, axes = plt.subplots(2, 1, figsize=(12, 6), facecolor='#0A0A0A')
    for idx, (data, label) in enumerate([(original, "BEFORE (Cleaned Mix)"), (mastered, "AFTER (Remastered)")]):
        ax = axes[idx]
        mono = np.mean(data, axis=1) if data.ndim == 2 else data
        ax.specgram(mono, NFFT=2048, Fs=sr, noverlap=1024, cmap='inferno', vmin=-110, vmax=0)
        ax.set_ylabel('Hz', color='#CCCCCC', fontsize=9)
        ax.set_title(label, color='#2B3BE5', fontsize=10, fontweight='bold', pad=5)
        ax.set_ylim(0, 20000)
        ax.tick_params(colors='#888888')
        ax.set_facecolor('#0A0A0A')
        for spine in ax.spines.values():
            spine.set_color('#2B2B2B')
    axes[1].set_xlabel('Time (s)', color='#CCCCCC', fontsize=9)
    plt.tight_layout()
    plt.savefig(str(output_img_path), dpi=100, facecolor='#0A0A0A', bbox_inches='tight')
    plt.close()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AGENT ORCHESTRATION LAYER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def run_agent_task(track_idx, track_path):
    """Fully handles a single track: acquisition, stem split, clean, remix, master."""
    t_start = time.time()
    track_name = track_path.stem
    agent_id = f"Agent-Cactus-{track_idx:02d}"
    
    print(f"\n[{agent_id}] 🟢 INITIALIZING AGENT MISSION FOR: {track_name}")
    
    # Step 1: Stem Separation (Throttled for hardware safety)
    stems_dir = SEPARATED_DIR / "htdemucs" / track_name
    vocals_file = stems_dir / "vocals.wav"
    
    if vocals_file.exists():
        print(f"[{agent_id}] Stems already present. Skipping separation.")
    else:
        print(f"[{agent_id}] Queueing for Demucs separation...")
        with DEMUCS_SEMAPHORE:
            print(f"[{agent_id}] ⚡ Demucs Lock ACQUIRED. Running separation...")
            cmd = ["demucs", "-o", str(SEPARATED_DIR), str(track_path)]
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"[{agent_id}] ❌ DEMUCS SEPARATION FAILED for: {track_name}\nStderr: {result.stderr}")
                return False
            print(f"[{agent_id}] ⚡ Demucs separation COMPLETE. Lock released.")

    # Step 2: Clean and Remix Stems
    print(f"[{agent_id}] Cleaning AI frequencies and remixing...")
    remix_path = REMIXED_DIR / f"{track_name}_remix.wav"
    try:
        mix_data, sr = clean_and_remix_stems(stems_dir, remix_path)
    except Exception as e:
        print(f"[{agent_id}] ❌ CLEAN/REMIX PROCESS FAILED: {str(e)}")
        return False
        
    # Step 3: Mastering
    print(f"[{agent_id}] Executing 12-stage mastering chain...")
    master_path = MASTERED_DIR / f"{track_name}_mastered.wav"
    try:
        post_stats, pre_stats, original_data, master_data = master_audio(
            remix_path, master_path, MASTER_PRESET
        )
    except Exception as e:
        print(f"[{agent_id}] ❌ MASTERING PROCESS FAILED: {str(e)}")
        return False

    # Step 4: Spectrogram Generation
    spec_path = MASTERED_DIR / f"{track_name}_spectrogram.png"
    try:
        generate_spec_plot(original_data, master_data, sr, spec_path)
    except Exception as e:
        print(f"[{agent_id}] Spectrogram plotting warning: {str(e)}")
        
    t_elapsed = time.time() - t_start
    print(f"[{agent_id}] 🏁 MISSION COMPLETE in {t_elapsed:.1f}s | Final: {post_stats['lufs']} LUFS, {post_stats['true_peak_dbtp']} dBTP")
    
    # Save ledger entry for C5-REAL verification
    ledger = {
        "agent": agent_id,
        "track": track_name,
        "reality": "C5-REAL",
        "duration_s": round(t_elapsed, 2),
        "source_sha256": sha256(str(track_path)),
        "output_sha256": sha256(str(master_path)),
        "analysis_before": pre_stats,
        "analysis_after": post_stats,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S%z")
    }
    with open(MASTERED_DIR / f"{track_name}_ledger.json", "w") as f:
        json.dump(ledger, f, indent=2)
        
    return True


def main():
    print("=" * 70)
    print("      CORTEX SOVEREIGN PARALLEL AUDIO SWARM v3.0")
    print("      Active Agents: 23 · Target: -11.0 LUFS · Reality: C5-REAL")
    print("=" * 70)
    
    # Scan downloads directory
    tracks = sorted(list(DOWNLOADS_DIR.glob("*.wav")))
    if len(tracks) == 0:
        print("❌ Error: No WAV tracks found in downloads folder. Mission aborted.")
        sys.exit(1)
        
    print(f"Found {len(tracks)} tracks for parallel processing.")
    
    t0 = time.time()
    
    # Launch exactly 23 parallel agents (one per track)
    with ThreadPoolExecutor(max_workers=len(tracks)) as executor:
        futures = {executor.submit(run_agent_task, idx + 1, track): track for idx, track in enumerate(tracks)}
        for future in futures:
            track = futures[future]
            try:
                success = future.result()
                if success:
                    print(f"✅ Success: {track.name}")
                else:
                    print(f"❌ Failed: {track.name}")
            except Exception as e:
                print(f"❌ Exception processing {track.name}: {str(e)}")
                
    elapsed = time.time() - t0
    print("\n" + "=" * 70)
    print(f"      ALL AGENTS RETURNING TO BASE. SYSTEM INGESTION COMPLETE.")
    print(f"      Total Swarm Processing Time: {elapsed/60:.2f} minutes")
    print(f"      Mastered Files Directory: {MASTERED_DIR}")
    print("=" * 70)

if __name__ == "__main__":
    main()
