import os
import subprocess
import json

print("REALITY LEVEL: C5-REAL (Building Laundry Orgy Audio)")

def run_cmd(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def get_duration(file_path):
    cmd = f'ffprobe -i "{file_path}" -show_entries format=duration -v quiet -of csv="p=0"'
    return float(subprocess.check_output(cmd, shell=True).decode().strip())

workspace_dir = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge"
public_dir = os.path.join(workspace_dir, "public")
src_dir = os.path.join(workspace_dir, "src")

# Dialogues
dialogues = [
    {
        "id": "l01_dj", "voice": "Rocko",
        "text": "¡MERCADILLO GANG PRESENTA... LA ORGÍA DE LA LAVANDERÍA AUTOMÁTICA!",
        "effect": "-af \"volume=1.5,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    },
    {
        "id": "l02_gon", "voice": "Eddy",
        "text": "¡Me cago en todo! ¡Me han metido en la lavadora número cuatro con el ciclo de centrifugado a mil revoluciones!",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3,tremolo=f=10:d=0.8,flanger\"", "who": "GON"
    },
    {
        "id": "l03_pan", "voice": "Mónica",
        "text": "¡Niño! ¡Quita tus chanclas de mi bata de cola! ¡Que me la estás manchando de suavizante Mimosín!",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "l04_pirri", "voice": "Grandpa",
        "text": "¡Jua, jua, jua! ¡Estoy reventando los cajetines de las monedas de dos euros! ¡Fiesta de espuma y billetes, chavales!",
        "effect": "-af \"asetrate=22050*1.15,atempo=1.05\"", "who": "EL PIRRI"
    },
    {
        "id": "l05_ramon", "voice": "Reed",
        "text": "¡ATENCIÓN! ¡La fricción estática de esas prendas genera un ritmo sujeto a derechos de autor! ¡Embargo de lavadoras activado!",
        "effect": "-af \"aphaser=speed=0.25:decay=0.4:delay=3:type=t,chorus=0.5:0.9:50:0.4:0.25:2\"", "who": "RAMONCÍN"
    },
    {
        "id": "l06_sfx", "voice": "Rocko",
        "text": "¡GLU GLU GLU! ¡BZZZZ! ¡PUM PUM PUM!",
        "effect": "-af \"volume=2.0,vibrato=f=15:d=1,aecho=0.8:0.9:100:0.7\"", "who": "LAVADORA"
    },
    {
        "id": "l07_gon", "voice": "Eddy",
        "text": "¡ME ESTOY MAREANDOOOOOOOO! ¡ESTO ES UNA ORGÍA DE ESPUMA Y CAOS!",
        "effect": "-af \"volume=1.8,tremolo=f=15:d=0.9,flanger=delay=8:depth=5\"", "who": "GON"
    },
    {
        "id": "l08_dj", "voice": "Rocko",
        "text": "¡FIN DEL CICLO! ¡DESBLOQUEANDO PUERTAS!",
        "effect": "-af \"volume=1.5,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    }
]

def build():
    tmp_dir = "/tmp/laundry_audio"
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
    
    # Generate random techno beat using sox/ffmpeg synth or just silence if no beat available. We'll use synth noise as a beat.
    bg_noise = os.path.join(tmp_dir, "bg_laundry.wav")
    run_cmd(f'ffmpeg -y -f lavfi -i "anoisesrc=c=pink:r=44100:a=0.1" -t {total_duration} "{bg_noise}"')
    
    mix_inputs = [f'-i "{bg_noise}"']
    for t in timeline:
        mix_inputs.append(f'-i "{t["wav_path"]}"')
        
    filter_parts = ["[0:a]volume=0.2[bg]"]
    amix_inputs = ["[bg]"]
    for idx, t in enumerate(timeline):
        delay_ms = int(t["s"] * 1000)
        input_label = f"[{idx+1}:a]"
        output_label = f"[a{idx+1}]"
        filter_parts.append(f"{input_label}adelay={delay_ms}|{delay_ms},volume=1.5{output_label}")
        amix_inputs.append(output_label)
        
    amix_str = "".join(amix_inputs)
    filter_parts.append(f"{amix_str}amix=inputs={len(amix_inputs)}:duration=first:dropout_transition=2[out]")
    
    final_wav_path = os.path.join(public_dir, "laundry_orgy.wav")
    run_cmd(f'ffmpeg -y {" ".join(mix_inputs)} -filter_complex "{";".join(filter_parts)}" -map "[out]" -t {total_duration:.2f} "{final_wav_path}"')
    
    subs_json = []
    for t in timeline:
        subs_json.append({"s": t["s"], "e": t["e"], "text": t["text"], "who": t["who"]})
        
    with open(os.path.join(src_dir, "subtitles_laundry.json"), "w") as f:
        json.dump(subs_json, f, indent=2, ensure_ascii=False)
        
    print(f"LAUNDRY AUDIO DONE. Duration: {total_duration}s")
    
if __name__ == "__main__":
    build()
