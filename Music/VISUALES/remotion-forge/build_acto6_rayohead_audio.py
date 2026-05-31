import os
import subprocess
import json

print("REALITY LEVEL: C5-REAL (Building Acto 6 - Rayohead in Vallekas)")

def run_cmd(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def get_duration(file_path):
    cmd = f'ffprobe -i "{file_path}" -show_entries format=duration -v quiet -of csv="p=0"'
    return float(subprocess.check_output(cmd, shell=True).decode().strip())

workspace_dir = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge"
public_dir = os.path.join(workspace_dir, "public")
src_dir = os.path.join(workspace_dir, "src")

dialogues = [
    {
        "id": "a6_01_dj", "voice": "Rocko",
        "text": "¡DE REPENTE EL ESCENARIO SE VUELVE GRIS! ¡ESTAMOS EN VALLECAS! ¡ES EL CONCIERTO DE RAYOHEAD!",
        "effect": "-af \"volume=1.5,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    },
    {
        "id": "a6_02_tomas_yorkje", "voice": "Diego",
        "text": "I'm a creeeeep... soy de Valleeeeeeeekaaaaaas... no me llega pal abono transpórteeeee...",
        "effect": "-af \"volume=2.5,vibrato=f=4:d=0.5,aecho=0.8:0.9:100:0.5,flanger=delay=5:depth=2\"", "who": "TOMAS YORKJE"
    },
    {
        "id": "a6_03_crowd", "voice": "Jorge",
        "text": "¡A LAS ARMAS! ¡VALLEKAS, PUERTO DE MAR! ¡RAYOHEAD, RAYOHEAD!",
        "effect": "-af \"volume=3.0,chorus=0.5:0.9:50:0.4:0.25:2,aecho=0.8:0.9:100:0.7\"", "who": "BUKANEROS"
    },
    {
        "id": "a6_04_tomas_yorkje", "voice": "Diego",
        "text": "What the hell am I doing heeeeereeee... I don't belong in Sálvame Deluuuuxeeee...",
        "effect": "-af \"volume=2.5,vibrato=f=3:d=0.7,aecho=0.8:0.9:150:0.6\"", "who": "TOMAS YORKJE"
    },
    {
        "id": "a6_05_gon", "voice": "Eddy",
        "text": "¡Pero qué bajona existencial es esta! ¡Estábamos de fiesta con Espinete y ahora Tomas Yorkje me está deprimiendo en un descampado de Vallecas!",
        "effect": "-af \"volume=1.8,tremolo=f=15:d=0.9,flanger=delay=8:depth=5\"", "who": "SON GON"
    },
    {
        "id": "a6_06_gon_sad", "voice": "Eddy",
        "text": "¡Y para colmo de males... me acabo de dar cuenta de que nunca he tenido la sensación de comer sardinas y no tener para lavarme los dientes después! ¡QUÉ TRISTEZA MÁS GRANDE! Buaaaaaa...",
        "effect": "-af \"volume=1.8,aecho=0.8:0.9:50:0.5,vibrato=f=10:d=1,asetrate=44100*0.8,atempo=1.25\"", "who": "SON GON (LLORANDO)"
    },
    {
        "id": "a6_07_pantoja_returns", "voice": "Paulina",
        "text": "¡Ya he vuelto, chiquillos! ¡Madre mía, qué estreñimiento más malo, me he tirado tres actos en el baño! ¡Uy, pero qué hace este guiri de ojo pipa cantando copla deprimente en Vallecas! ¡Alegría, coño!",
        "effect": "-af \"asetrate=44100*1.1,atempo=0.95,volume=1.7,aecho=0.8:0.9:80:0.6\"", "who": "ISABEL PANTOJA"
    }
]

def build():
    tmp_dir = "/tmp/acto6_audio"
    os.makedirs(tmp_dir, exist_ok=True)
    
    durations = []
    for d in dialogues:
        aiff_path = os.path.join(tmp_dir, f"{d['id']}_raw.aiff")
        wav_path = os.path.join(tmp_dir, f"{d['id']}.wav")
        run_cmd(f'say -v "{d["voice"]}" -o "{aiff_path}" "{d["text"]}"')
        run_cmd(f'ffmpeg -y -i "{aiff_path}" {d["effect"]} -ar 44100 -ac 2 "{wav_path}"')
        dur = get_duration(wav_path)
        durations.append(dur)
        
    timeline = []
    current_time = 0.5
    for idx, d in enumerate(dialogues):
        dur = durations[idx]
        start = current_time
        end = start + dur
        timeline.append({"s": round(start, 2), "e": round(end, 2), "text": d["text"], "who": d["who"], "wav_path": os.path.join(tmp_dir, f"{d['id']}.wav")})
        current_time = end + 0.5

    total_duration = current_time
    
    # Depressing wind / drone background
    bg_noise = os.path.join(tmp_dir, "bg_vallekas.wav")
    run_cmd(f'ffmpeg -y -f lavfi -i "anoisesrc=c=brown:r=44100:a=0.05" -t {total_duration} "{bg_noise}"')
    
    mix_inputs = [f'-i "{bg_noise}"']
    for t in timeline:
        mix_inputs.append(f'-i "{t["wav_path"]}"')
        
    filter_parts = ["[0:a]volume=0.3[bg]"]
    amix_inputs = ["[bg]"]
    for idx, t in enumerate(timeline):
        delay_ms = int(t["s"] * 1000)
        input_label = f"[{idx+1}:a]"
        output_label = f"[a{idx+1}]"
        filter_parts.append(f"{input_label}adelay={delay_ms}|{delay_ms},volume=1.5{output_label}")
        amix_inputs.append(output_label)
        
    amix_str = "".join(amix_inputs)
    filter_parts.append(f"{amix_str}amix=inputs={len(amix_inputs)}:duration=first:dropout_transition=2[out]")
    
    final_wav_path = os.path.join(public_dir, "acto6_rayohead.wav")
    run_cmd(f'ffmpeg -y {" ".join(mix_inputs)} -filter_complex "{";".join(filter_parts)}" -map "[out]" -t {total_duration:.2f} "{final_wav_path}"')
    
    subs_json = []
    for t in timeline:
        subs_json.append({"s": t["s"], "e": t["e"], "text": t["text"], "who": t["who"]})
        
    with open(os.path.join(src_dir, "subtitles_acto6.json"), "w") as f:
        json.dump(subs_json, f, indent=2, ensure_ascii=False)
        
    print(f"ACTO 6 AUDIO DONE. Duration: {total_duration}s")
    
if __name__ == "__main__":
    build()
