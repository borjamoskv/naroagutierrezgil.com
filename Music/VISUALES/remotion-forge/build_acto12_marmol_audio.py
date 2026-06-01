import os
import json
import subprocess

ACT = "acto12"
OUT_AUDIO = f"public/{ACT}_audio.wav"
OUT_SUBS = f"src/subtitles_{ACT}.json"

os.makedirs("public", exist_ok=True)
os.makedirs("src", exist_ok=True)

DIALOGUES = [
    {"voice": "Grandpa", "text": "Escuchadme bien. Todo el universo se arregla con una barbacoa. El carbón es la materia oscura, y la panceta...", "id": "Pablo Mármol", "filter": "highpass=f=200,lowpass=f=3000"}
]

subtitles = []
current_time = 0.0

d = DIALOGUES[0]
temp_wav = f"tmp_{ACT}.wav"

# Generate TTS
subprocess.run(["say", "-v", d["voice"], "-o", temp_wav, "--data-format=LEF32@44100", d["text"]])

# Apply filter
subprocess.run(["ffmpeg", "-y", "-i", temp_wav, "-af", d["filter"], "-c:a", "pcm_s16le", "-ar", "44100", OUT_AUDIO], stderr=subprocess.DEVNULL)

# Get duration
res = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", OUT_AUDIO], capture_output=True, text=True)
try:
    duration = float(res.stdout.strip())
except:
    duration = 5.0

# Cut it off slightly before it ends for the "abrupt cut" effect
cut_duration = duration - 0.5
subprocess.run(["ffmpeg", "-y", "-i", temp_wav, "-af", d["filter"], "-t", str(cut_duration), "-c:a", "pcm_s16le", "-ar", "44100", OUT_AUDIO], stderr=subprocess.DEVNULL)

subtitles.append({
    "text": d["text"],
    "start": 0.0,
    "end": cut_duration,
    "speaker": d["id"]
})

with open(OUT_SUBS, "w") as f:
    json.dump(subtitles, f, indent=2)

if os.path.exists(temp_wav):
    os.remove(temp_wav)

print(f"Generated {OUT_AUDIO} and {OUT_SUBS}")
