import os
import json
import subprocess

ACT_NAME = "acto7_pirri"
TMP_DIR = f"/tmp/{ACT_NAME}_audio"
os.makedirs(TMP_DIR, exist_ok=True)
OUT_DIR = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/public"
SRC_DIR = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/src"
os.makedirs(OUT_DIR, exist_ok=True)

# 44.1 kHz, stereo
BG_NOISE_SEC = 70.0

dialogues = [
    {
        "id": "a7_01_pantoja",
        "voice": "Paulina",
        "text": "Mira, me importa tres cojones el puto carajillo cuántico. Si ese cabrón del sombrerero no me apaga el puto Goenkale, le voy a meter la botella de coñac por el culo hasta que cante flamenco.",
        "ffmpeg_filter": "volume=1.7,asetrate=44100*1.1,atempo=0.95,pan=stereo|c0=0.3*FL|c1=FR,aecho=0.8:0.8:300:0.4",
        "delay_ms": 500,
        "avatar": "pantoja"
    },
    {
        "id": "a7_02_cura",
        "voice": "Diego",
        "text": "¡Y descenderé sobre ti con gran venganza y furiosa ira! ¡Ese vídeo es una puta herejía, joder! ¡Vais a ahogaros todos en un océano de sangre y orujo de hierbas!",
        "ffmpeg_filter": "volume=4.5,acrusher=level_in=8:level_out=1:bits=8:mode=log,tremolo=f=20:d=0.8,apulsator=hz=8,flanger=delay=10:depth=5",
        "delay_ms": 8000,
        "avatar": "cura_loco"
    },
    {
        "id": "a7_03_pirri",
        "voice": "Jorge",
        "text": "¿Pero tú qué te has creído, cura de mierda? Te voy a dar un pinchazo que te va a dejar el disco duro en formato RAW. ¡Dame la puta pasta o te rajo el cuello en 4K, joder!",
        "ffmpeg_filter": "volume=2.0,vibrato=f=4:d=0.5,flanger=delay=3:depth=2,pan=stereo|c0=FL|c1=0.3*FR,chorus=0.7:0.9:55:0.4:0.25:2",
        "delay_ms": 16000,
        "avatar": "pirri"
    },
    {
        "id": "a7_04_xabi",
        "voice": "Monica",
        "text": "¡Parad de gritar, joder! ¡Que me han diagnosticado luxación de escafoides! ¿Sabéis lo que pesa esta puta cabeza? ¡Tanta hostia y yo con la muñeca jodida, me cago en mi puta vida!",
        "ffmpeg_filter": "volume=2.5,asetrate=44100*0.8,atempo=1.2,aecho=0.8:0.9:500:0.5",
        "delay_ms": 24000,
        "avatar": "xabi_cabezas"
    },
    {
        "id": "a7_05_chimo",
        "voice": "Jorge",
        "text": "¡Hu-ha, hijos de puta! ¡Esto es pólvora pura! ¡Al que se mueva le meto un tiro entre ceja y ceja al ritmo del puto extasi! ¡La ruta del bakalao se paga en sangre!",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*1.3,atempo=1.1,aphaser=type=t:speed=2,aecho=0.8:0.8:100:0.7",
        "delay_ms": 32000,
        "avatar": "chimo_bayo"
    },
    {
        "id": "a7_06_fijoman",
        "voice": "Diego",
        "text": "¡Me cago en la puta, soy Fijoman, la llave fija humana de Burgos! ¡Mi tío Eddie Morci me enseñó a apretar tuercas a hostias! ¡Os voy a aflojar los tornillos del cráneo hasta que echéis morcilla cuántica por los ojos, joder!",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*0.9,atempo=1.1,aphaser=type=t,aecho=0.8:0.9:50:0.5,flanger=delay=5:depth=2",
        "delay_ms": 40000,
        "avatar": "fijoman"
    },
    {
        "id": "a7_07_melendi",
        "voice": "Diego",
        "text": "¡Eh, relajaos pibes, joder! ¡Bajad las putas pipas! ¡Por qué no nos fumamos un peta y saltamos un par de muros de hormigón? ¡Parkour y amor, hostia, que parecéis gilipollas!",
        "ffmpeg_filter": "volume=2.5,asetrate=44100*1.15,atempo=0.9,chorus=0.5:0.9:50:0.4:0.25:2,aecho=0.8:0.8:200:0.3",
        "delay_ms": 49000,
        "avatar": "melendi"
    },
    {
        "id": "a7_08_pirri_cuarta_pared",
        "voice": "Jorge",
        "text": "¡Y tú, Borja Moskv! ¡Deja de renderizar esta mierda! ¡O me subes los putos frames o salgo de la pantalla y te arranco la cabeza con un destornillador! ¡Se acabó la puta película!",
        "ffmpeg_filter": "volume=3.0,chorus=0.5:0.9:50:0.4:0.25:2,vibrato=f=8:d=0.8,aecho=0.8:0.9:40:0.5,extrastereo=m=5,aphaser=type=t",
        "delay_ms": 57000,
        "avatar": "pirri_navaja"
    }
]

subtitles = []
inputs = []
filter_complex = ""

# 1. Generate BG
bg_file = f"{TMP_DIR}/bg_street.wav"
print("Generating ethereal magical drone background...")
subprocess.run([
    "ffmpeg", "-y", 
    "-f", "lavfi", "-i", f"sine=frequency=432:duration={BG_NOISE_SEC}", 
    "-f", "lavfi", "-i", f"sine=frequency=540:duration={BG_NOISE_SEC}", 
    "-f", "lavfi", "-i", f"sine=frequency=648:duration={BG_NOISE_SEC}", 
    "-filter_complex", "[0:a]volume=0.1[a0];[1:a]volume=0.08[a1];[2:a]volume=0.06[a2];[a0][a1][a2]amix=inputs=3,chorus=0.5:0.9:50:0.4:0.25:2,aecho=0.8:0.9:1000:0.3[bg]", 
    "-map", "[bg]", bg_file
], check=True, capture_output=True)

inputs.append(bg_file)
filter_complex += "[0:a]volume=0.3[bg];"

# 2. Generate Dialogues
for i, d in enumerate(dialogues):
    idx = i + 1
    raw_aiff = f"{TMP_DIR}/{d['id']}_raw.aiff"
    processed_wav = f"{TMP_DIR}/{d['id']}.wav"
    
    print(f"Running: say -v \"{d['voice']}\" -o \"{raw_aiff}\" \"{d['text']}\"")
    subprocess.run(["say", "-v", d["voice"], "-o", raw_aiff, d["text"]], check=True)
    
    print(f"Running: ffmpeg -y -i \"{raw_aiff}\" -af \"{d['ffmpeg_filter']}\" -ar 44100 -ac 2 \"{processed_wav}\"")
    subprocess.run(["ffmpeg", "-y", "-i", raw_aiff, "-af", d["ffmpeg_filter"], "-ar", "44100", "-ac", "2", processed_wav], check=True, capture_output=True)
    
    duration_str = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", processed_wav], capture_output=True, text=True).stdout.strip()
    duration_ms = int(float(duration_str) * 1000)
    
    subtitles.append({
        "text": d["text"],
        "startMs": d["delay_ms"],
        "endMs": d["delay_ms"] + duration_ms,
        "avatar": d["avatar"]
    })
    
    inputs.append(processed_wav)
    filter_complex += f"[{idx}:a]adelay={d['delay_ms']}|{d['delay_ms']},volume=1.5[a{idx}];"

mix_inputs = "".join([f"[a{i+1}]" for i in range(len(dialogues))])
filter_complex += f"[bg]{mix_inputs}amix=inputs={len(dialogues)+1}:duration=first:dropout_transition=2[out]"

final_wav = f"{OUT_DIR}/{ACT_NAME}.wav"
ffmpeg_cmd = ["ffmpeg", "-y"]
for inp in inputs:
    ffmpeg_cmd.extend(["-i", inp])
ffmpeg_cmd.extend(["-filter_complex", filter_complex, "-map", "[out]", "-t", str(BG_NOISE_SEC), final_wav])

print(f"Running: {' '.join(ffmpeg_cmd)}")
subprocess.run(ffmpeg_cmd, check=True)

with open(f"{SRC_DIR}/subtitles_acto7.json", "w") as f:
    json.dump(subtitles, f, indent=2)

print(f"ACTO 7 AUDIO DONE. Duration: {BG_NOISE_SEC}s")
