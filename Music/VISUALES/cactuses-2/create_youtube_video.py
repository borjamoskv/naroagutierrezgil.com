#!/usr/bin/env python3
"""
CORTEX YouTube Album Video Assembler v1.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Concatenates mastered audio tracks, computes track timestamps for YouTube chapters,
and encodes a high-quality 1080p MP4 video with a static cover artwork.

Reality: C5-REAL (FFmpeg execution)
"""

import os
import re
import sys
from pathlib import Path
import soundfile as sf
import subprocess

BASE_DIR = Path("/Users/borjafernandezangulo/Music/VISUALES/cactuses-2")
MASTERED_DIR = BASE_DIR / "mastered"

def format_time(seconds):
    """Formats seconds to hh:mm:ss or mm:ss."""
    s = int(round(seconds))
    h = s // 3600
    m = (s % 3600) // 60
    sec = s % 60
    if h > 0:
        return f"{h:02d}:{m:02d}:{sec:02d}"
    else:
        return f"{m:02d}:{sec:02d}"

def get_track_number(path):
    """Extracts leading number from filename."""
    match = re.match(r"^(\d+)", path.name)
    return int(match.group(1)) if match else 999

def assemble_album():
    print("=" * 70)
    print("      CORTEX YOUTUBE ALBUM ASSEMBLY SYSTEM v1.0")
    print("      Target: 1080p Video + chapters.txt · Reality: C5-REAL")
    print("=" * 70)

    # 1. Detect cover image
    cover_extensions = [".png", ".jpg", ".jpeg"]
    cover_path = None
    for ext in cover_extensions:
        p = BASE_DIR / f"cover{ext}"
        if p.exists():
            cover_path = p
            break
            
    if not cover_path:
        print("❌ Error: No cover image found in base directory.")
        sys.exit(1)
        
    print(f"Cover Art Found: {cover_path.name}")

    # 2. Collect and sort mastered audio files
    wav_files = sorted(
        [f for f in MASTERED_DIR.glob("*_mastered.wav")],
        key=get_track_number
    )
    
    if not wav_files:
        print(f"❌ Error: No mastered WAV files found in: {MASTERED_DIR}")
        sys.exit(1)
        
    print(f"Found {len(wav_files)} mastered tracks.")

    # 3. Calculate timestamps and write chapters.txt + concat list
    concat_list_path = BASE_DIR / "ffmpeg_concat.txt"
    chapters_path = BASE_DIR / "chapters.txt"
    
    current_time = 0.0
    chapters = []
    
    with open(concat_list_path, "w") as f_concat:
        for idx, wav in enumerate(wav_files):
            clean_name = wav.stem.replace("_mastered", "")
            timestamp_str = format_time(current_time)
            chapters.append(f"{timestamp_str} - {clean_name}")
            print(f"Track {idx+1:02d}: {timestamp_str} | {clean_name}")
            
            escaped_path = str(wav.resolve()).replace("'", "'\\''")
            f_concat.write(f"file '{escaped_path}'\n")
            
            info = sf.info(wav)
            current_time += info.duration

    with open(chapters_path, "w") as f_chap:
        f_chap.write("\n".join(chapters) + "\n")
    print(f"✅ Chapters file written to: {chapters_path.name}")

    # 4. Concatenate audios using ffmpeg concat demuxer
    temp_audio_path = BASE_DIR / "album_concatenated_temp.wav"
    print("\nConcatenating audio tracks (this is lossless and fast)...")
    
    if temp_audio_path.exists():
        temp_audio_path.unlink()
        
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list_path),
        "-c", "copy",
        str(temp_audio_path)
    ]
    
    res = subprocess.run(concat_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"❌ Audio concatenation failed:\n{res.stderr}")
        sys.exit(1)
    print("✅ Audio concatenation complete.")

    # 5. Render Video
    output_video_path = Path("/Users/borjafernandezangulo/Desktop") / "CACTUSES_FULL_ALBUM.mp4"
    print(f"\nEncoding 1080p MP4 still-image video to Desktop...")
    
    render_cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-framerate", "2",
        "-i", str(cover_path),
        "-i", str(temp_audio_path),
        "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "320k",
        "-shortest",
        str(output_video_path)
    ]
    
    process = subprocess.Popen(render_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for line in process.stdout:
        pass
    process.wait()
    
    if concat_list_path.exists():
        concat_list_path.unlink()
    if temp_audio_path.exists():
        temp_audio_path.unlink()

    if process.returncode == 0:
        print("=" * 70)
        print(" 🎉 VIDEO ASSEMBLY COMPLETE!")
        print(f" 📂 Output Video: {output_video_path}")
        print(f" 📂 Chapters File: {chapters_path}")
        print("=" * 70)
    else:
        print("❌ Video rendering failed.")

if __name__ == "__main__":
    assemble_album()
