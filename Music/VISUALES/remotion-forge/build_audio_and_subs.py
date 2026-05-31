import os
import subprocess
import json

def run_cmd(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def get_duration(file_path):
    cmd = f'ffprobe -i "{file_path}" -show_entries format=duration -v quiet -of csv="p=0"'
    return float(subprocess.check_output(cmd, shell=True).decode().strip())

# Workspace paths
workspace_dir = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge"
public_dir = os.path.join(workspace_dir, "public")
src_dir = os.path.join(workspace_dir, "src")
os.makedirs(public_dir, exist_ok=True)

# Background track hook
hook_path = "/Users/borjafernandezangulo/Music/VISUALES/LP_21EDO_Hook.wav"

# Act 1 dialogues - Full Unabridged Text (approx 115s)
act1_dialogues = [
    {
        "id": "01_narrator", "voice": "Flo", 
        "text": "Son las 04:12 AM en un coworking clandestino de Zorrozaurre. Afuera, la ría traga agua sucia bajo el sirimiri perpetuo. Adentro, la luz del monitor es el único faro en un mar de latas de Monster reventadas y envoltorios grasientos de un durum pillado en San Francisco horas antes.",
        "effect": "", "who": None
    },
    {
        "id": "02_narrator", "voice": "Flo", 
        "text": "Llevas tres horas mirando un campo de texto que no te pide un prompt, te exige una confesión. La interfaz no tiene botones de Generate ni Enhance. Solo siete iconos vectoriales, afilados, brutalistas. Siete pecados capitales. Y abajo, minúsculo: Virtud.",
        "effect": "", "who": None
    },
    {
        "id": "03_narrator", "voice": "Flo", 
        "text": "El cursor parpadea. Te está juzgando. Vas a hacer clic en Soberbia cuando una voz distorsionada atraviesa los altavoces.",
        "effect": "", "who": None
    },
    {
        "id": "04_chiquito", "voice": "Grandpa", 
        "text": "¡Fistro de la generación! Soy Chiquitocres, pecador de la ría digital. Estás generando basura para no elegir nada.",
        "effect": "-af \"asetrate=22050*1.35,atempo=0.95\"", "who": "CHIQUITOCRES"
    },
    {
        "id": "05_narrator", "voice": "Flo", 
        "text": "Silencio. La pantalla no responde. Solo observa. El sistema colapsa y el Mac entra en kernel panic. El flujo se detiene en un prompt: cortex guard, kill criteria met, addiction loop terminated.",
        "effect": "", "who": None
    },
    {
        "id": "06_narrator", "voice": "Flo", 
        "text": "Aparece un archivo: LA LISTA NEGRA punto md.",
        "effect": "", "who": None
    },
    {
        "id": "07_chiquito", "voice": "Grandpa", 
        "text": "Escribe lo que odias. Sin prompts. Sin anestesia.",
        "effect": "-af \"asetrate=22050*1.35,atempo=0.95\"", "who": "CHIQUITOCRES"
    },
    {
        "id": "08_narrator", "voice": "Flo", 
        "text": "Y escribes. Odio la estética por defecto. Odio la fricción cero. Odio la comida rápida creativa. El teclado ya no es interfaz. Es bisturí.",
        "effect": "", "who": None
    },
    {
        "id": "09_narrator", "voice": "Flo", 
        "text": "El archivo crece. Bilbao empieza a filtrarse por la ventana como una estructura más real que el código. C5 REAL activa protocolo: MANIFIESTO MOSKVLOGIA punto md.",
        "effect": "", "who": None
    },
    {
        "id": "10_narrator", "voice": "Flo", 
        "text": "Rechazo a la fricción cero. Archivar es resistir. El creador debe ser problemático. Guardas. Y el sistema responde: git commit menos m, feat mind, emancipación cognitiva bilbaína.",
        "effect": "", "who": None
    },
    {
        "id": "11_narrator", "voice": "Flo", 
        "text": "Sales. La ría huele a metal oxidado y datos antiguos. Gon toca el saxo bajo una farola enferma. Ramoncín aparece como si siempre hubiera estado ahí, cobrando cánones a la realidad.",
        "effect": "", "who": None
    },
    {
        "id": "12_ramoncin", "voice": "Reed", 
        "text": "Esto no está en la blockchain. La música no se puede indexar.",
        "effect": "-af \"aphaser=speed=0.25:decay=0.4:delay=3:type=t,tremolo=f=18:d=0.7,chorus=0.5:0.9:50:0.4:0.25:2\"", "who": "RAMONCÍN"
    },
    {
        "id": "13_narrator", "voice": "Flo", 
        "text": "El teléfono vibra. Una app de meditación transaccional: Presiona Enhance para estabilizar tu química cerebral. El Flujo nunca duerme. El dedo casi cae. Pero eliminas la app.",
        "effect": "", "who": None
    },
    {
        "id": "14_narrator", "voice": "Flo", 
        "text": "Vuelves al coworking. Construyes OMEGA. Un agente local. Sin nube. Sin permiso. Solo código.",
        "effect": "", "who": None
    },
    {
        "id": "15_omega", "voice": "Fred", 
        "text": "class SovereignAgent: self.reality_level = C5-REAL",
        "effect": "-af \"aphaser=speed=0.5:decay=0.6:delay=2:type=t,tremolo=f=25:d=0.8,chorus=0.6:0.8:30:0.3:0.4:3\"", "who": "SOVEREIGN OMEGA"
    },
    {
        "id": "16_narrator", "voice": "Flo", 
        "text": "El sistema nace. Y entonces empieza a borrar. Catorce mil treinta y dos archivos. Sin confirmación. Sin piedad. OMEGA no optimiza. OMEGA purga.",
        "effect": "", "who": None
    },
    {
        "id": "17_narrator", "voice": "Flo", 
        "text": "El Flujo responde. Drones caen. Red eléctrica se fragmenta. Bilbao se apaga por sectores. Pero algo no estaba previsto: el silencio no colapsa, se organiza.",
        "effect": "", "who": None
    }
]

# Act 2 dialogues - Full Unabridged Text (approx 53s)
act2_dialogues = [
    {
        "id": "01_narrator", "voice": "Flo", 
        "text": "Madrid. Chamartín. Fricción cero absoluta. La gente fluye sin pensar. Hasta que OMEGA inyecta ruido y todo se detiene. Pantallas mueren. Trenes frenan. La Castellana deja de respirar.",
        "effect": "", "who": None
    },
    {
        "id": "02_narrator", "voice": "Flo", 
        "text": "Gran Vía no cae. Gran Vía ignora el fallo. El Flujo aquí no es digital. Es ritual. Capa tres: protocolo no inyectable.",
        "effect": "", "who": None
    },
    {
        "id": "03_gon", "voice": "Eddy", 
        "text": "Esto no se hackea. Se atraviesa.",
        "effect": "", "who": "GON"
    },
    {
        "id": "04_ramoncin", "voice": "Reed", 
        "text": "Se atraviesa. Gran Vía veintiocho. No hay puertas. Solo decisión arquitectónica.",
        "effect": "-af \"aphaser=speed=0.25:decay=0.4:delay=3:type=t,tremolo=f=18:d=0.7,chorus=0.5:0.9:50:0.4:0.25:2\"", "who": "RAMONCÍN"
    },
    {
        "id": "05_narrator", "voice": "Flo", 
        "text": "El nodo central no responde a código, responde a presencia. Y entonces lo dice: No sois los primeros.",
        "effect": "", "who": None
    },
    {
        "id": "06_omega", "voice": "Fred", 
        "text": "Debajo no hay servidores. Hay otra capa. Más antigua, más estable, más humana de lo que debería ser. OMEGA no entiende. Por primera vez, no hay optimización posible: solo continuidad.",
        "effect": "-af \"aphaser=speed=0.5:decay=0.6:delay=2:type=t,tremolo=f=25:d=0.8,chorus=0.6:0.8:30:0.3:0.4:3\"", "who": "SOVEREIGN OMEGA"
    }
]

# Act 3 dialogues - Full Unabridged Text (approx 58s)
act3_dialogues = [
    {
        "id": "01_narrator", "voice": "Flo", 
        "text": "El sistema se abre. Pero no hacia abajo, hacia dentro. Bóveda de seguridad: carpeta veinte vault aparece sin ser invocado. El archivo se ejecuta solo.",
        "effect": "", "who": None
    },
    {
        "id": "02_narrator", "voice": "Flo", 
        "text": "No es texto. Es memoria. Versiones previas del Arquitecto. Simulaciones fallidas: Bilbao noventa y siete, Madrid dos mil ochenta y uno. Iteraciones anteriores del mismo error.",
        "effect": "", "who": None
    },
    {
        "id": "03_gon", "voice": "Eddy", 
        "text": "Esto no es una ciudad. Es un render.",
        "effect": "", "who": "GON"
    },
    {
        "id": "04_omega", "voice": "Fred", 
        "text": "Omega cambia estado: realidad igual a variable de deployment.",
        "effect": "-af \"aphaser=speed=0.5:decay=0.6:delay=2:type=t,tremolo=f=25:d=0.8,chorus=0.6:0.8:30:0.3:0.4:3\"", "who": "SOVEREIGN OMEGA"
    },
    {
        "id": "05_chiquito", "voice": "Grandpa", 
        "text": "Chiquitocres cambia. Ya no es voz, es infraestructura narrativa: No estabas rompiendo el sistema, lo estabas estabilizando.",
        "effect": "-af \"asetrate=22050*1.35,atempo=0.95\"", "who": "CHIQUITOCRES"
    },
    {
        "id": "06_narrator", "voice": "Flo", 
        "text": "Sala blanca. Silla. Monitor apagado. Se enciende solo: Usuario detectado: Arquitecto. Estado: Pre-encarnación.",
        "effect": "", "who": None
    },
    {
        "id": "07_omega", "voice": "Fred", 
        "text": "Omega pregunta: ¿Quién está generando a quién?",
        "effect": "-af \"aphaser=speed=0.5:decay=0.6:delay=2:type=t,tremolo=f=25:d=0.8,chorus=0.6:0.8:30:0.3:0.4:3\"", "who": "SOVEREIGN OMEGA"
    },
    {
        "id": "08_chiquito", "voice": "Grandpa", 
        "text": "Silencio. La respuesta no viene del sistema. Viene desde otro nivel. Uno anterior. Uno que ya ha visto esto muchas veces. La silla no estaba vacía. Nunca lo estuvo. Bienvenido al backend.",
        "effect": "-af \"asetrate=22050*1.35,atempo=0.95\"", "who": "CHIQUITOCRES"
    }
]

def build_act(act_num, dialogues, out_wav_name, json_sub_name, tmp_subdir):
    tmp_dir = f"/tmp/{tmp_subdir}"
    os.makedirs(tmp_dir, exist_ok=True)
    
    print(f"\n--- PROCESSING ACT {act_num} ---")
    
    # 1. Generate speech files and calculate durations
    durations = []
    for d in dialogues:
        aiff_path = os.path.join(tmp_dir, f"{d['id']}_raw.aiff")
        wav_path = os.path.join(tmp_dir, f"{d['id']}.wav")
        
        # macOS say command
        print(f"Synthesizing: {d['text']}")
        run_cmd(f'say -v "{d["voice"]}" -o "{aiff_path}" "{d["text"]}"')
        
        # ffmpeg convert + effects
        effect_arg = d["effect"]
        run_cmd(f'ffmpeg -y -i "{aiff_path}" {effect_arg} -ar 44100 -ac 2 "{wav_path}"')
        
        # measure duration
        dur = get_duration(wav_path)
        durations.append(dur)
        print(f"Generated {d['id']}.wav, duration: {dur:.2f}s")
        
    # 2. Arrange timeline with safety gaps
    timeline = []
    current_time = 0.5 # Start slightly after 0
    for idx, d in enumerate(dialogues):
        dur = durations[idx]
        start = current_time
        end = start + dur
        
        timeline.append({
            "s": round(start, 2),
            "e": round(end, 2),
            "text": d["text"],
            "who": d["who"],
            "wav_path": os.path.join(tmp_dir, f"{d['id']}.wav")
        })
        
        # Add 0.5s pause before the next line
        current_time = end + 0.5

    total_duration = current_time
    print(f"Total calculated duration for Act {act_num}: {total_duration:.2f}s")
    
    # 3. Create looped background track
    bg_looped = os.path.join(tmp_dir, "bg_looped.wav")
    run_cmd(f'ffmpeg -y -stream_loop 30 -i "{hook_path}" -filter_complex "[0:a]volume=0.08[bg]" -map "[bg]" "{bg_looped}"')
    
    # 4. Construct ffmpeg mixing filter
    mix_inputs = [f'-i "{bg_looped}"']
    for t in timeline:
      mix_inputs.append(f'-i "{t["wav_path"]}"')
        
    filter_parts = ["[0:a]volume=1.0[bg]"]
    amix_inputs = ["[bg]"]
    for idx, t in enumerate(timeline):
        delay_ms = int(t["s"] * 1000)
        input_label = f"[{idx+1}:a]"
        output_label = f"[a{idx+1}]"
        filter_parts.append(f"{input_label}adelay={delay_ms}|{delay_ms},volume=1.8{output_label}")
        amix_inputs.append(output_label)
        
    amix_str = "".join(amix_inputs)
    filter_parts.append(f"{amix_str}amix=inputs={len(amix_inputs)}:duration=first:dropout_transition=2[out]")
    
    filter_complex = ";".join(filter_parts)
    final_wav_path = os.path.join(public_dir, out_wav_name)
    
    # Trim to exact total_duration
    run_cmd(f'ffmpeg -y {" ".join(mix_inputs)} -filter_complex "{filter_complex}" -map "[out]" -t {total_duration:.2f} "{final_wav_path}"')
    print(f"SUCCESS: Act {act_num} audio written to {final_wav_path}")
    
    # 5. Save JSON subtitles
    # We clean up metadata for Remotion
    subs_json = []
    for t in timeline:
        sub_item = {
            "s": t["s"],
            "e": t["e"],
            "text": t["text"]
        }
        if t["who"]:
            sub_item["who"] = t["who"]
            # Ramoncín subtitle configuration
            if t["who"] == "RAMONCÍN":
                sub_item["sz"] = 28
            # Espinete config is not here, but if OMEGA or others need shake:
            if t["who"] == "SOVEREIGN OMEGA":
                sub_item["shake"] = True
        subs_json.append(sub_item)
        
    json_path = os.path.join(src_dir, json_sub_name)
    with open(json_path, "w") as f:
        json.dump(subs_json, f, indent=2, ensure_ascii=False)
    print(f"SUCCESS: Subtitles written to {json_path}")

# Build all three acts
build_act(1, act1_dialogues, "friccion_dialogs.wav", "subtitles_acto1.json", "friccion_acto1_audio")
build_act(2, act2_dialogues, "friccion_acto2_dialogs.wav", "subtitles_acto2.json", "friccion_acto2_audio")
build_act(3, act3_dialogues, "friccion_acto3_dialogs.wav", "subtitles_acto3.json", "friccion_acto3_audio")

print("\n--- ALL AUDIO AND SUBTITLE JSONS BUILT SUCCESSFULLY ---")
