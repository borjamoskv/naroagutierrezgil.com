import os
import subprocess
import json

print("REALITY LEVEL: C5-REAL (Building Acto 5 - Fito-verse Concert)")

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
        "id": "a5_01_dj", "voice": "Rocko",
        "text": "¡TRAS EL CAOS DEL MERCADILLO, NUESTROS HÉROES APARECEN EN EL MULTIVERSO FITO!",
        "effect": "-af \"volume=1.5,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    },
    {
        "id": "a5_02_fito_stage", "voice": "Jorge",
        "text": "¡Buenas noches Bilbao! ¡Buenas noches a mí mismo multiplicado por diez mil! ¡Qué maravilla ver a tantos Fitos entre el público!",
        "effect": "-af \"volume=2.0,aecho=0.8:0.9:80:0.6,flanger=delay=3:depth=2\"", "who": "FITO (ESCENARIO)"
    },
    {
        "id": "a5_03_fitocrowd", "voice": "Diego",
        "text": "¡FITO! ¡FITO! ¡SOMOS TÚ! ¡QUÍTATE LA GORRA QUE YO TAMBIÉN LA LLEVO! ¡FITO!",
        "effect": "-af \"volume=3.0,chorus=0.5:0.9:50:0.4:0.25:2,aecho=0.8:0.9:100:0.7\"", "who": "PÚBLICO (MILES DE FITOS)"
    },
    {
        "id": "a5_04_fito_stage", "voice": "Jorge",
        "text": "¡Pues claro que sí! ¡Ahí va 'Soldadito Tribunero', por decimocuarta vez consecutiva sin pausa!",
        "effect": "-af \"volume=2.0,aecho=0.8:0.9:80:0.6,vibrato=f=4:d=0.3\"", "who": "FITO (ESCENARIO)"
    },
    {
        "id": "a5_05_fito_singing", "voice": "Jorge",
        "text": "¡Sool-da-di-to tri-bu-neee-roo... co-no-ciste a una si-re-naaaa... y te embargó la hipo-te-caaaa!",
        "effect": "-af \"asetrate=44100*1.05,atempo=0.9,volume=2.2,aecho=0.8:0.9:80:0.6\"", "who": "FITO (CANTANDO)"
    },
    {
        "id": "a5_06_fitocrowd", "voice": "Diego",
        "text": "¡OTRA VEZ! ¡TÓCALA OTRA VEZ, YO DEL FUTURO! ¡VAMOS POR LA QUINCE!",
        "effect": "-af \"volume=3.0,chorus=0.7:0.9:60:0.4:0.25:2,aecho=0.8:0.9:100:0.7\"", "who": "PÚBLICO (MILES DE FITOS)"
    },
    {
        "id": "a5_07_espinete_doraemon", "voice": "Juan",
        "text": "¡Ay Doraemon, cariño, qué romántico es este concierto con miles de Fitos! ¡Saca un dorayaki de amor de tu bolsillo mágico!",
        "effect": "-af \"volume=2.0,asetrate=44100*1.3,atempo=0.8,aecho=0.8:0.9:50:0.5\"", "who": "ESPINETE (ENAMORADO)"
    },
    {
        "id": "a5_08_gon", "voice": "Eddy",
        "text": "¡Pero qué tortura existencial es esta! ¡El infierno son otros... y los otros son todos Fito! ¡Y ahora Espinete y Doraemon son pareja! ¡ESTO NO TIENE SENTIDO!",
        "effect": "-af \"volume=1.8,tremolo=f=15:d=0.9,flanger=delay=8:depth=5\"", "who": "SON GON"
    }
]

def build():
    tmp_dir = "/tmp/acto5_audio"
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
    
    # Stadium noise background
    bg_noise = os.path.join(tmp_dir, "bg_stadium.wav")
    run_cmd(f'ffmpeg -y -f lavfi -i "anoisesrc=c=brown:r=44100:a=0.1" -t {total_duration} "{bg_noise}"')
    
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
    
    final_wav_path = os.path.join(public_dir, "acto5_fito_concert.wav")
    run_cmd(f'ffmpeg -y {" ".join(mix_inputs)} -filter_complex "{";".join(filter_parts)}" -map "[out]" -t {total_duration:.2f} "{final_wav_path}"')
    
    subs_json = []
    for t in timeline:
        subs_json.append({"s": t["s"], "e": t["e"], "text": t["text"], "who": t["who"]})
        
    with open(os.path.join(src_dir, "subtitles_acto5.json"), "w") as f:
        json.dump(subs_json, f, indent=2, ensure_ascii=False)
        
    print(f"ACTO 5 AUDIO DONE. Duration: {total_duration}s")
    
if __name__ == "__main__":
    build()
