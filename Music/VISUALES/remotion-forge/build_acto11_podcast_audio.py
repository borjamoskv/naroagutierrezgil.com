import os
import json
import subprocess

ACT = "acto11"
OUT_AUDIO = f"public/{ACT}_audio.wav"
OUT_SUBS = f"src/subtitles_{ACT}.json"

os.makedirs("public", exist_ok=True)
os.makedirs("src", exist_ok=True)

DIALOGUES = [
    {"voice": "Rocko", "text": "Yo estuve en la estructura... y la estructura no era sostenible emocionalmente.", "id": "Terapeuta", "filter": "highpass=f=200,lowpass=f=3000"},
    {"voice": "Eddy", "text": "Gol... pero fácil.", "id": "Romário", "filter": "highpass=f=200,lowpass=f=3000"},
    {"voice": "Reed", "text": "Yo vi cosas en esa serie que no eran guion.", "id": "Chechu", "filter": "highpass=f=200,lowpass=f=3000"},
    {"voice": "Grandpa", "text": "La vida es como el espinazo de una caballa, si no lo entiendes, estás perdido.", "id": "Popeye", "filter": "highpass=f=200,lowpass=f=3000"},
    {"voice": "Flo", "text": "El chat es Dios... pero en low latency.", "id": "Streamer", "filter": "highpass=f=200,lowpass=f=3000"},
    {"voice": "Eddy", "text": "El problema no es táctico, es de actitud cuántica.", "id": "Entrenador", "filter": "highpass=f=200,lowpass=f=3000"},
    {"voice": "Grandma", "text": "Veo un hombre... con problemas de RAM emocional.", "id": "Vidente", "filter": "highpass=f=200,lowpass=f=3000,echo=0.8:0.8:60:0.4"},
    {"voice": "Sandy", "text": "Esto no es nostalgia, es firmware emocional.", "id": "DJ", "filter": "highpass=f=200,lowpass=f=3000,chorus=0.5:0.9:50:0.4:0.25:2"},
    {"voice": "Shelley", "text": "La isla de las tentaciones es un tratado de Versalles emocional.", "id": "Político", "filter": "highpass=f=200,lowpass=f=3000"},
    {"voice": "Paulina", "text": "Yo estuve en el episodio original, pero lo borraron.", "id": "Misterioso", "filter": "highpass=f=100,lowpass=f=2000,tremolo=f=5.0:d=0.8"}
]

subtitles = []
current_time = 0.0
concat_files = []

for i, d in enumerate(DIALOGUES):
    temp_wav = f"tmp_{ACT}_{i}.wav"
    filtered_wav = f"tmp_{ACT}_{i}_filtered.wav"
    
    # Create empty filtered file
    if os.path.exists(filtered_wav):
        os.remove(filtered_wav)

    # Generate TTS
    subprocess.run(["say", "-v", d["voice"], "-o", temp_wav, "--data-format=LEF32@44100", d["text"]])
    
    # Apply filter
    flt = d.get("filter", "copy")
    if flt == "copy":
        subprocess.run(["ffmpeg", "-y", "-i", temp_wav, "-c:a", "pcm_f32le", filtered_wav], stderr=subprocess.DEVNULL)
    else:
        subprocess.run(["ffmpeg", "-y", "-i", temp_wav, "-af", flt, "-c:a", "pcm_f32le", filtered_wav], stderr=subprocess.DEVNULL)
        
    # Get duration
    res = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filtered_wav], capture_output=True, text=True)
    try:
        duration = float(res.stdout.strip())
    except:
        duration = 2.0
    
    subtitles.append({
        "text": d["text"],
        "start": current_time,
        "end": current_time + duration,
        "speaker": d["id"]
    })
    
    # Add a 0.5s pause
    current_time += duration + 0.5 
    concat_files.append(filtered_wav)
    
    # Generate silence file
    silence_wav = f"tmp_{ACT}_{i}_silence.wav"
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", "0.5", "-c:a", "pcm_f32le", silence_wav], stderr=subprocess.DEVNULL)
    concat_files.append(silence_wav)

with open(f"concat_list_{ACT}.txt", "w") as f:
    for file in concat_files:
        f.write(f"file '{file}'\n")

subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", f"concat_list_{ACT}.txt", "-c:a", "pcm_s16le", "-ar", "44100", OUT_AUDIO], stderr=subprocess.DEVNULL)

with open(OUT_SUBS, "w") as f:
    json.dump(subtitles, f, indent=2)

for f in concat_files:
    if os.path.exists(f):
        os.remove(f)
if os.path.exists(f"concat_list_{ACT}.txt"):
    os.remove(f"concat_list_{ACT}.txt")

print(f"Generated {OUT_AUDIO} and {OUT_SUBS}")
