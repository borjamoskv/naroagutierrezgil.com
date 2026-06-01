import subprocess
import json
import os
import sys

def get_video_duration(filepath):
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "json", filepath
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(res.stdout)
    return float(data["format"]["duration"])

def main():
    print("Step 1: Concatenating all acts into out/Living_Las_Grecas_Master.mp4...")
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", "concat_grecas.txt",
        "-c", "copy",
        "out/Living_Las_Grecas_Master.mp4"
    ]
    subprocess.run(concat_cmd, check=True)
    print("Concatenation complete.")

    # Get exact duration
    master_file = "out/Living_Las_Grecas_Master.mp4"
    duration = get_video_duration(master_file)
    print(f"Verified Master Video Duration: {duration:.3f} seconds.")

    # Calculate overlay parameters
    # The Xokas avatar scales from w=10, h=7.5 to w=1200, h=900 over duration D.
    # Formula: w = 10 + 1190 * (t / D)
    #          h = 7.5 + 892.5 * (t / D)
    w_expr = f"10+1190*(t/{duration:.3f})"
    h_expr = f"7.5+892.5*(t/{duration:.3f})"
    sub_start = duration - 20.0
    sub_end = duration

    print(f"Step 2: Applying Xokas scaling overlay and subtitle overlay (enable between {sub_start:.3f} and {sub_end:.3f})...")
    
    # We use h264_videotoolbox for macOS hardware acceleration
    overlay_cmd = [
        "ffmpeg", "-y",
        "-i", master_file,
        "-loop", "1", "-i", "public/xokas.png",
        "-loop", "1", "-i", "public/subtitle.png",
        "-filter_complex",
        f"[1:v]format=rgba,scale=eval=frame:w='{w_expr}':h='{h_expr}'[xokas];"
        f"[0:v][xokas]overlay=x='(W-w)/2':y='(H-h)/2':eval=frame:shortest=1[video_xokas];"
        f"[video_xokas][2:v]overlay=enable='between(t,{sub_start:.3f},{sub_end:.3f})':shortest=1",
        "-c:v", "h264_videotoolbox",
        "-b:v", "6000k",
        "-c:a", "copy",
        "out/Living_Las_Grecas_Master_Xokas.mp4"
    ]

    print("Running command: " + " ".join(overlay_cmd))
    subprocess.run(overlay_cmd, check=True)
    print("Overlay process finished successfully!")
    
    final_file = "out/Living_Las_Grecas_Master_Xokas.mp4"
    final_duration = get_video_duration(final_file)
    print(f"Final Video path: {final_file}")
    print(f"Final Video duration: {final_duration:.3f} seconds.")

if __name__ == "__main__":
    main()
