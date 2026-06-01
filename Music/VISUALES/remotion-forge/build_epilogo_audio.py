import os
import subprocess
import json

def main():
    out_dir = "public"
    tmp_dir = "/tmp/epilogo_audio"
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(tmp_dir, exist_ok=True)
    
    dialogues = [
        {
            "id": "epi_01_salchicha",
            "voice": "Paulina",
            "text": "Al final... todo esto era un directo mal cerrado.",
            "ffmpeg_filter": "volume=3.5,asetrate=44100*0.9,atempo=1.1,flanger=delay=2:depth=2",
            "delay_ms": 3000,
            "avatar": "salchicha_triste"
        },
        {
            "id": "epi_02_xokas",
            "voice": "Jorge",
            "text": "Vale... voy a ser sincero. Buyo es mi padre.",
            "ffmpeg_filter": "volume=4.5,asetrate=44100*1.1,atempo=0.9",
            "delay_ms": 8000,
            "avatar": "xokas"
        },
        {
            "id": "epi_03_buyo",
            "voice": "Diego",
            "text": "Yo solo vine a parar esto... pero ya veo que tarde.",
            "ffmpeg_filter": "volume=4.0,asetrate=44100*0.8,atempo=1.2",
            "delay_ms": 14000,
            "avatar": "buyo"
        },
        {
            "id": "epi_04_kaseo",
            "voice": "Alvaro",
            "text": "La realidad no falló. Solo se hizo demasiado literal.",
            "ffmpeg_filter": "volume=4.5,asetrate=44100*0.9,atempo=1.1,aecho=0.8:0.9:500:0.4",
            "delay_ms": 22000,
            "avatar": "kaseo"
        }
    ]
    
    # Generate base TTS and filter
    for d in dialogues:
        raw_aiff = os.path.join(tmp_dir, f"{d['id']}_raw.aiff")
        filt_wav = os.path.join(tmp_dir, f"{d['id']}_filt.wav")
        
        # macOS say
        tts_cmd = [
            "say",
            "-v", d['voice'],
            "-o", raw_aiff,
            d["text"]
        ]
        subprocess.run(tts_cmd, check=True)
        
        # FFmpeg filter
        ff_cmd = [
            "ffmpeg", "-y", "-i", raw_aiff,
            "-af", d["ffmpeg_filter"],
            filt_wav
        ]
        subprocess.run(ff_cmd, check=True)

    # Calculate timings and generate subtitles.json
    subtitles = []
    current_ms = 0
    
    # We will generate a base ambient track (silence + noise) for 35 seconds
    total_duration_s = 35.0
    
    for i, d in enumerate(dialogues):
        filt_wav = os.path.join(tmp_dir, f"{d['id']}_filt.wav")
        
        # Get duration
        dur_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filt_wav]
        dur_str = subprocess.check_output(dur_cmd).decode("utf-8").strip()
        dur_ms = int(float(dur_str) * 1000)
        
        start_ms = d["delay_ms"]
        end_ms = start_ms + dur_ms
        
        subtitles.append({
            "startMs": start_ms,
            "endMs": end_ms,
            "text": d["text"],
            "avatar": d["avatar"]
        })
        
    with open("src/subtitles_epilogo.json", "w") as f:
        json.dump(subtitles, f, indent=2)

    # Mix audio
    inputs = []
    filter_complex = []
    
    # Generate noise and sine wave for ambient
    inputs.extend(["-f", "lavfi", "-i", f"anoisesrc=c=brown:r=48000:a=0.1:duration={total_duration_s}"])
    filter_complex.append(f"[0:a]volume=0.3[amb];")
    
    # Add dialogue tracks
    for i, d in enumerate(dialogues):
        filt_wav = os.path.join(tmp_dir, f"{d['id']}_filt.wav")
        inputs.extend(["-i", filt_wav])
        delay_ms = d["delay_ms"]
        filter_complex.append(f"[{i+1}:a]adelay={delay_ms}|{delay_ms}[d{i+1}];")

    mix_parts = "[amb]" + "".join([f"[d{i+1}]" for i in range(len(dialogues))])
    filter_complex.append(f"{mix_parts}amix=inputs={len(dialogues)+1}:duration=first:dropout_transition=3[out]")
    
    final_output = os.path.join(out_dir, "epilogo.wav")
    
    mix_cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", "".join(filter_complex),
        "-map", "[out]",
        final_output
    ]
    
    print("Running FFmpeg combination...")
    subprocess.run(mix_cmd, check=True)
    print(f"EPILOGO AUDIO DONE. Duration: {total_duration_s}s")

if __name__ == "__main__":
    main()
