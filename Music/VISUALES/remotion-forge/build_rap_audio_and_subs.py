import os
import subprocess
import json

# Declare reality level
print("REALITY LEVEL: C5-REAL (Building updated audio with Galician-Toledan Stoichkov)")

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

# Rap Dialogues
rap_dialogues = [
    # INTRO
    {
        "id": "01_dj", "voice": "Rocko",
        "text": "Mercadillo Gang presenta...",
        "effect": "-af \"volume=1.4,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    },
    {
        "id": "02_dj", "voice": "Rocko",
        "text": "El choque de titanes que nadie pidió...",
        "effect": "-af \"volume=1.4,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    },
    {
        "id": "03_dj", "voice": "Rocko",
        "text": "pero que España necesitaba.",
        "effect": "-af \"volume=1.4,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    },
    # VERSO 1 - GON
    {
        "id": "04_gon", "voice": "Eddy",
        "text": "Yo vengo del mercadillo con chancla y sudadera,",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "05_gon", "voice": "Eddy",
        "text": "tú vienes de Cantora vendiendo la pulsera",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "06_gon", "voice": "Eddy",
        "text": "que le mangaste a Paquirri, ¿o fue la bandera?",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "07_gon", "voice": "Eddy",
        "text": "No sé, es que tu historia cambia cada primavera.",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "08_gon", "voice": "Eddy",
        "text": "Isabel, reina del drama, tonadilla y el juzgado,",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "09_gon", "voice": "Eddy",
        "text": "más causas pendientes que discos has sacado.",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "10_gon", "voice": "Eddy",
        "text": "Yo soy el rey del trapicheo en el rastrillo,",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "11_gon", "voice": "Eddy",
        "text": "tú eres la reina de empeñar hasta el anillo.",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "12_gon", "voice": "Eddy",
        "text": "Me dicen tonto, vale, ¡pero yo no debo a Hacienda!",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "13_gon", "voice": "Eddy",
        "text": "Tú le debes tanto al fisco que Montoro te usa de leyenda.",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "14_gon", "voice": "Eddy",
        "text": "Cantora se cae a trozos como tu carrera,",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "15_gon", "voice": "Eddy",
        "text": "yo con dos euros monto un imperio en la acera.",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "16_gon", "voice": "Eddy",
        "text": "No me vengas con 'Se me enamora el alma',",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "17_gon", "voice": "Eddy",
        "text": "que tu alma está embargada, tía, no tiene calma.",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "18_gon", "voice": "Eddy",
        "text": "Gon no necesita abogado pa' sus guerras,",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "19_gon", "voice": "Eddy",
        "text": "tú necesitas tres pa' no acabar entre rejas.",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    # VERSO 2 - ISABEL PANTOJA
    {
        "id": "20_pan", "voice": "Mónica",
        "text": "Mira, niñato, yo llené el Bernabéu,",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "21_pan", "voice": "Mónica",
        "text": "tú llenas una manta en el suelo, ¿eso es un museo?",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "22_pan", "voice": "Mónica",
        "text": "Soy la Pantoja, llevo España en la garganta,",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "23_pan", "voice": "Mónica",
        "text": "tú llevas tres camisetas falsas que nadie compra ni aguanta.",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "24_pan", "voice": "Mónica",
        "text": "He cenado con presidentes, con reyes, con toreros,",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "25_pan", "voice": "Mónica",
        "text": "tú cenas bocata de lomo en un banco con tus compañeros.",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "26_pan", "voice": "Mónica",
        "text": "¿Mercadillo Gang? Eso suena a IVA sin declarar,",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "27_pan", "voice": "Mónica",
        "text": "yo al menos cuando robo lo hago sin disimular.",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "28_pan", "voice": "Mónica",
        "text": "Kiko ya no me habla, Isa no me llama,",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "29_pan", "voice": "Mónica",
        "text": "pero al menos tengo hijos, ¿tú qué tienes? ¡Una cama",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "30_pan", "voice": "Mónica",
        "text": "de camping que huele a feria de pueblo!",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "31_pan", "voice": "Mónica",
        "text": "Yo soy leyenda viva, tú eres el hazmerreír del pueblo.",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    # VERSO 3 - GON
    {
        "id": "32_gon", "voice": "Eddy",
        "text": "¿Leyenda? Sí, leyenda urbana del BOE,",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "33_gon", "voice": "Eddy",
        "text": "entre embargos y pufos tu nombre ya no se lee.",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "34_gon", "voice": "Eddy",
        "text": "Agustín Pantoja te maneja como un títere,",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "35_gon", "voice": "Eddy",
        "text": "yo soy libre, huelo a mercadillo y a libertad, ¿y tú?",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "36_gon", "voice": "Eddy",
        "text": "A perfume caro que pagó Julián Muñoz.",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "37_gon", "voice": "Eddy",
        "text": "Que tu novio era alcalde y robaba en Marbella,",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "38_gon", "voice": "Eddy",
        "text": "tú decías 'yo no sabía', clásica doncella.",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "39_gon", "voice": "Eddy",
        "text": "Pero aquí en el rastrillo sabemos la verdad:",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "40_gon", "voice": "Eddy",
        "text": "la Pantoja sabe más de...",
        "effect": "-af \"volume=1.5,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    # EL PIRRI INTERRUPTION
    {
        "id": "41_sfx", "voice": "Rocko",
        "text": "¡SCREEECH! ¡RUM RUM! ¡Trompo salvaje con el ciento veinticuatro robado!",
        "effect": "-af \"asetrate=22050*0.75,atempo=1.1,aphaser=speed=0.5:decay=0.6:delay=4:type=t\"", "who": "DJ"
    },
    {
        "id": "42_pirri", "voice": "Grandpa",
        "text": "¡Qué pasa chavales! ¡Aparco el ciento veinticuatro aquí derrapando y me marco un breakdance de locos! ¡Mirad cómo giro en el suelo!",
        "effect": "-af \"asetrate=22050*1.15,atempo=1.05\"", "who": "EL PIRRI"
    },
    {
        "id": "43_gon", "voice": "Eddy",
        "text": "¡Hostia! ¡Pero si es el Pirri! ¡Y mira qué molino se está haciendo en el capó del coche! ¡Qué guapada, chaval!",
        "effect": "-af \"volume=1.4,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "44_pan", "voice": "Mónica",
        "text": "¡Es mi oportunidad! ¡Toma...",
        "effect": "-af \"volume=1.6,aecho=0.8:0.9:30:0.5\"", "who": "ISABEL PANTOJA"
    },
    # RAMONCIN & STOICHKOV CRASH
    {
        "id": "45_ramon", "voice": "Reed",
        "text": "¡ALTO EN NOMBRE DE LA SOCIEDAD DE AUTORES! ¡Este breakdance infringe el copyright del movimiento rotatorio! ¡Y esa base musical no tiene licencia de emisión pública!",
        "effect": "-af \"aphaser=speed=0.25:decay=0.4:delay=3:type=t,tremolo=f=18:d=0.7,chorus=0.5:0.9:50:0.4:0.25:2\"", "who": "RAMONCÍN"
    },
    {
        "id": "46_stoichkov", "voice": "Mónica",
        "text": "¡Escondede as carteiras, rapaces! ¡Ramoncín ten toda a razón! ¡Árbitro comprado, xente de Valladolid! ¡Que eu son de Toledo de toda a vida, carallo, e vós estades todos parvos!",
        "effect": "-af \"asetrate=44100*1.15,atempo=0.9,vibrato=f=6:d=0.5,volume=1.6\"", "who": "STOICHKOV"
    },
    {
        "id": "47_sfx_pisotón", "voice": "Rocko",
        "text": "¡CHAF! ¡CRAC! ¡Metatarsos triturados!",
        "effect": "-af \"asetrate=22050*0.6,atempo=1.2,volume=1.8\"", "who": "DJ"
    },
    {
        "id": "48_gon", "voice": "Eddy",
        "text": "¡Aaaaaah! ¡El metatarso! ¡Stoichkov me ha pisado con fuerza toledana! ¡Eso no es gallego, es terrorismo de autor!",
        "effect": "-af \"volume=1.4,equalizer=f=1500:width_type=q:width=1:g=3\"", "who": "GON"
    },
    {
        "id": "49_pan", "voice": "Mónica",
        "text": "¡Hristo! ¡A mí no me hables en gallego ni me vengas con Toledo! ¡Que tú eres de Bulgaria y a mí no me tose ningún extranjero!",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "50_ramon", "voice": "Reed",
        "text": "¡Isabel! Toda opinión xenófoba sobre os nosos colaboradores leva un recargo do SGAE. ¡Hristo, pisotón gallego a Cantora!",
        "effect": "-af \"aphaser=speed=0.25:decay=0.4:delay=3:type=t,tremolo=f=18:d=0.7,chorus=0.5:0.9:50:0.4:0.25:2\"", "who": "RAMONCÍN"
    },
    {
        "id": "51_stoichkov", "voice": "Mónica",
        "text": "¡A min non me chames búlgaro, caralla! ¡Que son de Toledo, de Toledo capital! ¡Toma pisotón toledano na bata de cola!",
        "effect": "-af \"asetrate=44100*1.15,atempo=0.9,vibrato=f=6:d=0.5,volume=1.6\"", "who": "STOICHKOV"
    },
    {
        "id": "52_pan", "voice": "Mónica",
        "text": "¡Ay, mi clavel! ¡Me ha pisado la bata de cola! ¡Kiko, sácame de este calvario tributario!",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "53_pirri", "voice": "Grandpa",
        "text": "¡Hostia, vaya tela con los del fútbol y la SGAE! ¡Yo cojo el ciento veinticuatro y me piro derrapando antes de que llegue el coche patrulla! ¡Hasta luego, caras!",
        "effect": "-af \"asetrate=22050*1.15,atempo=1.05\"", "who": "EL PIRRI"
    },
    {
        "id": "54_dj", "voice": "Rocko",
        "text": "¡VAYA DERRAPE FINAL! ¡El Pirri escapa con el ciento veinticuatro robado a toda pastilla!",
        "effect": "-af \"volume=1.4,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    },
    {
        "id": "55_dj", "voice": "Rocko",
        "text": "¡Gon y la Pantoja yacen en el suelo gimiendo de dolor con los dedos rotos!",
        "effect": "-af \"volume=1.4,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    },
    {
        "id": "56_dj", "voice": "Rocko",
        "text": "¡Gana Ramoncín y Stoichkov por embargo mercantil y agresión física directa!",
        "effect": "-af \"volume=1.4,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    },
    {
        "id": "57_dj", "voice": "Rocko",
        "text": "¡MERCADILLO GANG... HA SIDO TOTALMENTE EMBARGADO POR LA SGAE! ¡HASTA NUNCA!",
        "effect": "-af \"volume=1.4,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    },
    {
        "id": "58_sfx", "voice": "Rocko",
        "text": "¡BZZZ! ¡FWOOOOSH! ¡Un resplandor amarillo ciega el asfalto del mercadillo!",
        "effect": "-af \"asetrate=22050*1.5,atempo=1.2,aphaser=speed=2:decay=0.8:delay=2:type=t,volume=1.5\"", "who": "DJ"
    },
    {
        "id": "59_songon", "voice": "Eddy",
        "text": "¡AAAAAAAAAAAAAAAAH! ¡Me habéis tocado el metatarso pero no mi orgullo de barrio! ¡Pelo amarillo! ¡Fase Dios del mercadillo! ¡SOY SON GON!",
        "effect": "-af \"volume=2.0,equalizer=f=1500:width_type=q:width=1:g=3,aecho=0.8:0.9:50:0.5,flanger=delay=5:depth=2\"", "who": "SON GON"
    },
    {
        "id": "60_pan", "voice": "Mónica",
        "text": "¡Ay mi madre, que se le ha erizado el pelo rubio bote! ¡Ese tinte no es de peluquería cara, es de bazar de todo a cien!",
        "effect": "-af \"volume=1.5,aecho=0.8:0.88:45:0.45\"", "who": "ISABEL PANTOJA"
    },
    {
        "id": "61_stoichkov", "voice": "Mónica",
        "text": "¡Nin súper saiyan nin leches! ¡Un pisotón toledano nivel tres acabarache con ese pelo de pallaso, carallo!",
        "effect": "-af \"asetrate=44100*1.15,atempo=0.9,vibrato=f=6:d=0.5,volume=1.6\"", "who": "STOICHKOV"
    },
    {
        "id": "62_songon", "voice": "Eddy",
        "text": "¡KAME... HAME... CHAAAAANCLAAAAAA!",
        "effect": "-af \"volume=2.5,equalizer=f=1500:width_type=q:width=1:g=3,aecho=0.8:0.9:50:0.7,chorus=0.5:0.9:50:0.4:0.25:2\"", "who": "SON GON"
    },
    {
        "id": "63_dj", "voice": "Rocko",
        "text": "¡Y EXPLOTÓ EL RASTRILLO! ¡VICTORIA ABSOLUTA DE SON GON! ¡TODO PULVERIZADO EN ENERGÍA YINMN BLUE Y ORO OXIDADO!",
        "effect": "-af \"volume=1.6,aphaser=speed=0.4:decay=0.5:delay=2:type=t\"", "who": "DJ"
    }
]

def build_rap():
    tmp_dir = "/tmp/rap_battle_audio"
    os.makedirs(tmp_dir, exist_ok=True)
    
    print("\n--- PROCESSING RAP BATTLE AUDIO WITH GALICIAN STOICHKOV FROM TOLEDO ---")
    
    # 1. Generate speech files and calculate durations
    durations = []
    for d in rap_dialogues:
        aiff_path = os.path.join(tmp_dir, f"{d['id']}_raw.aiff")
        wav_path = os.path.join(tmp_dir, f"{d['id']}.wav")
        
        # macOS say command
        print(f"Synthesizing [{d['who']}]: {d['text']}")
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
    current_time = 1.0 # Start slightly after 1s for beat drop
    for idx, d in enumerate(rap_dialogues):
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
        
        # Determine gap. If speaker switches, give a slightly larger pause
        is_next_different = (idx < len(rap_dialogues) - 1 and rap_dialogues[idx+1]["who"] != d["who"])
        gap = 0.8 if is_next_different else 0.4
        current_time = end + gap

    total_duration = current_time
    print(f"Total calculated duration: {total_duration:.2f}s")
    
    # 3. Create looped background track
    bg_looped = os.path.join(tmp_dir, "bg_looped.wav")
    run_cmd(f'ffmpeg -y -stream_loop 35 -i "{hook_path}" -filter_complex "[0:a]volume=0.08[bg]" -map "[bg]" "{bg_looped}"')
    
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
    final_wav_name = "rap_battle_dialogs.wav"
    final_wav_path = os.path.join(public_dir, final_wav_name)
    
    # Trim to exact total_duration
    run_cmd(f'ffmpeg -y {" ".join(mix_inputs)} -filter_complex "{filter_complex}" -map "[out]" -t {total_duration:.2f} "{final_wav_path}"')
    print(f"SUCCESS: Rap battle audio written to {final_wav_path}")
    
    # 5. Save JSON subtitles
    subs_json = []
    for t in timeline:
        sub_item = {
            "s": t["s"],
            "e": t["e"],
            "text": t["text"]
        }
        if t["who"]:
            sub_item["who"] = t["who"]
            if t["who"] == "ISABEL PANTOJA":
                sub_item["sz"] = 34
                sub_item["shake"] = True
            elif t["who"] == "GON":
                sub_item["sz"] = 32
                sub_item["shake"] = False
            elif t["who"] == "EL PIRRI":
                sub_item["sz"] = 32
                sub_item["shake"] = True
            elif t["who"] == "RAMONCÍN":
                sub_item["sz"] = 30
                sub_item["shake"] = True
            elif t["who"] == "STOICHKOV":
                sub_item["sz"] = 36
                sub_item["shake"] = True
        subs_json.append(sub_item)
        
    json_path = os.path.join(src_dir, "subtitles_rap.json")
    with open(json_path, "w") as f:
        json.dump(subs_json, f, indent=2, ensure_ascii=False)
    print(f"SUCCESS: Subtitles written to {json_path}")
    
    return total_duration

if __name__ == "__main__":
    duration = build_rap()
    print(f"RAP BATTLE GENERATION COMPLETE. Total duration: {duration:.2f}s")
