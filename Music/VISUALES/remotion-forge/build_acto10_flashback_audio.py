import os
import subprocess
import json

BG_NOISE_SEC = 90.0

dialogues = [
    {
        "id": "a10_01_narrador",
        "voice": "Alvaro",
        "text": "Año 1647. Un herrero llamado Eddie Morci encuentra una taza enterrada. El Carajillo Original. Descubre algo terrible: el líquido no concede deseos. Convierte las opiniones en materia.",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*0.9,atempo=1.1,aecho=0.8:0.9:150:0.6",
        "delay_ms": 2000,
        "avatar": "narrador_antiguo"
    },
    {
        "id": "a10_02_narrador_2",
        "voice": "Alvaro",
        "text": "Así nacieron los Cuñados Supremos. Las recreativas conscientes. Las ovejas administrativas. Todos son residuos. Fósiles mentales del absurdo humano.",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*0.9,atempo=1.1,aecho=0.8:0.9:150:0.6",
        "delay_ms": 16000,
        "avatar": "narrador_antiguo"
    },
    {
        "id": "a10_03_pantoja",
        "voice": "Paulina",
        "text": "¡Aaaaaaayyyyyyyy! ¡Sostengo el cieloooo con mi quejío cuááááánticooooo!",
        "ffmpeg_filter": "volume=5.0,asetrate=44100*1.4,atempo=0.6,vibrato=f=12:d=1.0,aecho=0.8:1.0:1000:0.8,chorus=0.5:0.9:50:0.4:0.25:2",
        "delay_ms": 28000,
        "avatar": "pantoja_diosa"
    },
    {
        "id": "a10_04_piccolo",
        "voice": "Jorge",
        "text": "Soy un inspector dimensional. Llevo siglos intentando cerrar la grieta del Carajillo. Pero sinceramente, con lo que cuesta mantener la nave Namekiana, al final te haces un plan de pensiones y a tomar por culo.",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*0.8,atempo=1.2,aecho=0.8:0.8:50:0.3",
        "delay_ms": 38000,
        "avatar": "piccolo_inspector"
    },
    {
        "id": "a10_05_pablo",
        "voice": "Diego",
        "text": "A ver, Piccolo, tú mírame. El universo es como una barbacoa. Si usas pastillas químicas de encendido, la carne sabe a mierda. Yo nunca he bebido de esa taza. Por eso veo la verdad. Pero la gente prefiere el microondas.",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*1.0,atempo=1.0,aecho=0.8:0.8:20:0.2",
        "delay_ms": 52000,
        "avatar": "pablo_oraculo"
    },
    {
        "id": "a10_06_algoritmo",
        "voice": "Monica",
        "text": "ATENCIÓN. ANOMALÍA CREATIVA DETECTADA. INICIANDO PROTOCOLO DE SENTIDO COMÚN. TODO EL PERSONAL DEBE RELLENAR EL FORMULARIO B-42 EN TEAMS PARA SOLICITAR EXISTENCIA.",
        "ffmpeg_filter": "volume=4.5,asetrate=44100*1.1,atempo=0.9,acrusher=bits=4,tremolo=f=50:d=1,aecho=1:1:500:0.5,flanger=delay=20:depth=10",
        "delay_ms": 66000,
        "avatar": "algoritmo_sentido_comun"
    },
    {
        "id": "a10_07_fijoman",
        "voice": "Diego",
        "text": "¡Me cago en el formulario y en las normativas! ¡Yo no busco la llave! ¡YO SOY LA LLAVE! ¡Vamos a abrir la puerta del caos, joder!",
        "ffmpeg_filter": "volume=4.0,acrusher=bits=8,asetrate=44100*0.9,atempo=1.1,tremolo=f=30:d=0.4,aecho=0.8:0.8:50:0.5",
        "delay_ms": 80000,
        "avatar": "fijoman_llave"
    }
]

def main():
    tmp_dir = "/tmp/acto10_flashback_audio"
    os.makedirs(tmp_dir, exist_ok=True)
    
    out_dir = "public"
    os.makedirs(out_dir, exist_ok=True)
    
    final_wav = os.path.join(out_dir, "acto10_flashback.wav")
    
    # 1. Generate base TTS and filter
    for d in dialogues:
        raw_mp3 = os.path.join(tmp_dir, f"{d['id']}_raw.mp3")
        filt_wav = os.path.join(tmp_dir, f"{d['id']}_filt.wav")
        
        # Edge TTS
        tts_cmd = [
            "edge-tts",
            "--voice", f"es-ES-{d['voice']}Neural",
            "--text", d["text"],
            "--write-media", raw_mp3
        ]
        subprocess.run(tts_cmd, check=True)
        
        # FFmpeg filter
        ff_cmd = [
            "ffmpeg", "-y", "-i", raw_mp3,
            "-af", d["ffmpeg_filter"],
            filt_wav
        ]
        subprocess.run(ff_cmd, check=True)
        
    # 2. Combine all with delays onto a background noise track (Deep rumble + glitch)
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"anoisesrc=c=brown:r=48000:a=0.1:duration={BG_NOISE_SEC}",
        "-f", "lavfi", "-i", f"sine=frequency=30:duration={BG_NOISE_SEC}" # Deep sub-bass hum
    ]
    
    for d in dialogues:
        filt_wav = os.path.join(tmp_dir, f"{d['id']}_filt.wav")
        ffmpeg_cmd.extend(["-i", filt_wav])
        
    filter_complex = ""
    # Add delays
    for i, d in enumerate(dialogues):
        idx = i + 2 # indices 0 and 1 are bg noise
        filter_complex += f"[{idx}:a]adelay={d['delay_ms']}|{d['delay_ms']}[aud{i}]; "
        
    # Mix background noises
    filter_complex += "[0:a]volume=0.3[bg1]; [1:a]volume=0.2[bg2]; [bg1][bg2]amix=inputs=2[bg]; "
    
    # Mix everything
    amix_inputs = "[bg]" + "".join([f"[aud{i}]" for i in range(len(dialogues))])
    filter_complex += f"{amix_inputs}amix=inputs={len(dialogues) + 1}:normalize=0[out]"
    
    ffmpeg_cmd.extend(["-filter_complex", filter_complex, "-map", "[out]", "-t", str(BG_NOISE_SEC), final_wav])
    
    print("Running FFmpeg combination...")
    subprocess.run(ffmpeg_cmd, check=True)
    
    # 3. Export subtitles JSON
    subs_json = "src/subtitles_acto10.json"
    with open(subs_json, "w", encoding="utf-8") as f:
        json.dump(dialogues, f, indent=4, ensure_ascii=False)
        
    print(f"ACTO 10 AUDIO DONE. Duration: {BG_NOISE_SEC}s")

if __name__ == "__main__":
    main()
