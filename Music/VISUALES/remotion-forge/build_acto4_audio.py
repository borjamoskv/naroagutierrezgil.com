import os
import subprocess
import json

print("REALITY LEVEL: C5-REAL (Building Acto 4 - Son Gon vs Paz Padilla)")

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
        "id": "a4_01_dj", "voice": "Rocko",
        "text": "¡ALERTA DE INTRUSIÓN! ¡PAZ PADILLA HA ENTRADO AL CANVAS CON UN JAMÓN IBÉRICO CINCO JOTAS!",
        "effect": "-af \"volume=1.5,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    },
    {
        "id": "a4_02_songon", "voice": "Eddy",
        "text": "¡Fase Dios del Mercadillo al máximo! ¡KAME HAME... CHAAAANCLAAAA!",
        "effect": "-af \"volume=2.0,equalizer=f=1500:width_type=q:width=1:g=3,aecho=0.8:0.9:50:0.5,flanger\"", "who": "SON GON"
    },
    {
        "id": "a4_03_paz", "voice": "Paulina",
        "text": "¡Ay, chiquillo! ¡Que te lo desvío con la pezuña del cerdo! ¡Toma escudo refractante andaluz!",
        "effect": "-af \"asetrate=44100*1.1,atempo=0.95,volume=1.6\"", "who": "PAZ PADILLA"
    },
    {
        "id": "a4_04_songon", "voice": "Eddy",
        "text": "¡Imposible! ¡Mi energía YInMn Blue está siendo absorbida! ¡Mi pelo de super saiyan se está convirtiendo en churros!",
        "effect": "-af \"volume=1.8,tremolo=f=15:d=0.9,flanger=delay=8:depth=5\"", "who": "SON GON"
    },
    {
        "id": "a4_05_paz", "voice": "Paulina",
        "text": "¡Claro que sí, miarma! Y ahora los mojo en chocolate dimensional y los meto en mi táper al vacío. ¡Expansión de Dominio: Sálvame Deluxe!",
        "effect": "-af \"asetrate=44100*1.1,atempo=0.95,aecho=0.8:0.9:100:0.7,volume=1.7\"", "who": "PAZ PADILLA"
    },
    {
        "id": "a4_06_dj", "voice": "Rocko",
        "text": "¡SON GON HA SIDO DERROTADO POR EL HUMOR DE LEPE! ¡QUÉ BIZARRO!",
        "effect": "-af \"volume=1.5,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    },
    {
        "id": "a4_07_sfx", "voice": "Rocko",
        "text": "¡BUM! ¡BUM! ¡BUM! ¡TIEMBLA LA TIERRA!",
        "effect": "-af \"volume=2.5,vibrato=f=15:d=1,aecho=0.8:0.9:100:0.7,asetrate=22050*0.5\"", "who": "DJ"
    },
    {
        "id": "a4_08_chiquitocres", "voice": "Jorge",
        "text": "¡QUIETÓÓÓÓÓR! ¡Pecadores de la pradera! ¡Siete caballos vienen de Bonanza! ¡Yo soy CHIQUITOCRES, el titán diodenar de nivel diez mil! ¡JARL!",
        "effect": "-af \"volume=2.5,vibrato=f=12:d=0.6,aecho=0.8:0.9:60:0.5,flanger,asetrate=44100*0.8\"", "who": "CHIQUITOCRES"
    },
    {
        "id": "a4_09_paz", "voice": "Paulina",
        "text": "¡Pero bueno! ¡Si es un kaiju con camisa de lunares y movimientos pélvicos imposibles! ¡Mi escudo de jamón no resistirá su ataque de chistes malos!",
        "effect": "-af \"asetrate=44100*1.1,atempo=0.95,aecho=0.8:0.9:100:0.7,volume=1.7\"", "who": "PAZ PADILLA"
    },
    {
        "id": "a4_10_songon", "voice": "Eddy",
        "text": "¡Me da igual que seas un Titán, Chiquitocres! ¡Porque yo he viajado en el tiempo, me he casado con mi abuela, y AHORA SOY MI PROPIO TÍO! ¡Toma paradoja temporal, pecador!",
        "effect": "-af \"volume=2.0,equalizer=f=1500:width_type=q:width=1:g=3,aecho=0.8:0.9:50:0.5,flanger=delay=5:depth=2\"", "who": "SON GON"
    },
    {
        "id": "a4_11_espontaneo", "voice": "Jorge",
        "text": "¡¡QUE FRANCO SIGUE MUERTO, OLEEEEEE!!",
        "effect": "-af \"volume=3.0,aecho=0.8:0.9:100:0.7,flanger=delay=3:depth=2,asetrate=44100*1.1\"", "who": "ESPONTÁNEO"
    }
]

def build():
    tmp_dir = "/tmp/acto4_audio"
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
    
    bg_noise = os.path.join(tmp_dir, "bg_acto4.wav")
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
    
    final_wav_path = os.path.join(public_dir, "acto4_paz_padilla.wav")
    run_cmd(f'ffmpeg -y {" ".join(mix_inputs)} -filter_complex "{";".join(filter_parts)}" -map "[out]" -t {total_duration:.2f} "{final_wav_path}"')
    
    subs_json = []
    for t in timeline:
        subs_json.append({"s": t["s"], "e": t["e"], "text": t["text"], "who": t["who"]})
        
    with open(os.path.join(src_dir, "subtitles_acto4.json"), "w") as f:
        json.dump(subs_json, f, indent=2, ensure_ascii=False)
        
    print(f"ACTO 4 AUDIO DONE. Duration: {total_duration}s")
    
if __name__ == "__main__":
    build()
