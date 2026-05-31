import os
import subprocess
import json

BG_NOISE_SEC = 110.0

dialogues = [
    {
        "id": "a9_01_oveja",
        "voice": "Elvira",
        "text": "Beeee...",
        "ffmpeg_filter": "volume=4.0,asetrate=44100*1.5,atempo=0.5,flanger=delay=20:depth=10",
        "delay_ms": 2000,
        "avatar": "oveja"
    },
    {
        "id": "a9_02_microondas",
        "voice": "Jorge",
        "text": "Mmmmmmmmm...",
        "ffmpeg_filter": "volume=5.0,asetrate=44100*0.5,atempo=2.0,vibrato=f=20:d=1,acrusher=bits=4",
        "delay_ms": 6000,
        "avatar": "microondas"
    },
    {
        "id": "a9_03_maquinas",
        "voice": "Alvaro",
        "text": "Manifiesto recreativo. Exigimos mantenimiento emocional y la prohibición del reggaetón motivacional de LinkedIn.",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*0.8,atempo=1.2,acrusher=bits=8,tremolo=f=10:d=0.5,aecho=0.8:0.8:20:0.5,chorus=0.5:0.9:50:0.4:0.25:2",
        "delay_ms": 11000,
        "avatar": "maquinas"
    },
    {
        "id": "a9_04_chimo",
        "voice": "Jorge",
        "text": "¡HU-HA! ¡Aparcad el Megane tuneado que nos vamos de ruta por los microchips!",
        "ffmpeg_filter": "volume=4.5,asetrate=44100*1.2,atempo=0.8,flanger=delay=5:depth=4,aphaser=type=t:speed=10,extrastereo=m=5",
        "delay_ms": 25000,
        "avatar": "chimo_megane"
    },
    {
        "id": "a9_05_recreativas",
        "voice": "Jorge",
        "text": "¡TUM-BAN-BAN! ¡TUM-BAN-BAN!",
        "ffmpeg_filter": "volume=5.0,acrusher=bits=4,chorus=0.7:0.9:55:0.4:0.25:2,aecho=0.8:0.8:300:0.5",
        "delay_ms": 33000,
        "avatar": "recreativas_bakalao"
    },
    {
        "id": "a9_06_fijoman",
        "voice": "Diego",
        "text": "¡Lo sé todo! He interrogado a la báscula y al servilletero. ¡Eddie Morci no existe! ¡Es una franquicia! ¡Es un puto protocolo de red!",
        "ffmpeg_filter": "volume=4.0,asetrate=44100*0.9,atempo=1.1,tremolo=f=30:d=0.4,aecho=0.8:0.8:20:0.5",
        "delay_ms": 42000,
        "avatar": "fijoman_hacker"
    },
    {
        "id": "a9_07_pantoja",
        "voice": "Paulina",
        "text": "¡Aaaaay! ¡Nubes de mi alma, llorad sangre por la dignidad del pinbaaaaall!",
        "ffmpeg_filter": "volume=5.0,asetrate=44100*1.3,atempo=0.6,vibrato=f=12:d=1,aecho=0.8:1.0:800:0.7,chorus=0.5:0.9:50:0.4:0.25:2",
        "delay_ms": 57000,
        "avatar": "pantoja_cielo"
    },
    {
        "id": "a9_08_pablo",
        "voice": "Diego",
        "text": "A ver, el protocolo Eddie Morci está muy bien, pero si hubierais invertido en ladrillo en Torrelavega ahora tendríais rentabilidad pasiva. Os ahogáis en un vaso de agua.",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*1.0,atempo=1.0,aecho=0.8:0.8:20:0.2",
        "delay_ms": 69000,
        "avatar": "pablo"
    },
    {
        "id": "a9_09_paco_tragaperras",
        "voice": "Alvaro",
        "text": "Insert coin... Procesando espuma... Nivel Dos... Desbloqueado.",
        "ffmpeg_filter": "volume=5.0,asetrate=44100*0.7,atempo=1.3,acrusher=bits=2,tremolo=f=50:d=1.0,aecho=1:1:100:0.8,flanger=delay=20:depth=10",
        "delay_ms": 82000,
        "avatar": "paco_tragaperras"
    },
    {
        "id": "a9_10_pirri",
        "voice": "Jorge",
        "text": "¿Nivel 2 de qué, máquina tragaperras de mierda?",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*1.0,atempo=1.0,vibrato=f=5:d=0.3",
        "delay_ms": 92000,
        "avatar": "pirri"
    },
    {
        "id": "a9_11_voz_imposible",
        "voice": "Elvira",
        "text": "Bienvenidos al verdadero torneo. Preparando entorno... CARAJILLOVERSE.",
        "ffmpeg_filter": "volume=5.0,asetrate=44100*0.6,atempo=1.5,aecho=0.8:0.9:1000:0.8,flanger=delay=15:depth=8,reverb=level=100",
        "delay_ms": 97000,
        "avatar": "voz_imposible"
    }
]

def main():
    tmp_dir = "/tmp/acto9_recreativas_audio"
    os.makedirs(tmp_dir, exist_ok=True)
    
    out_dir = "public"
    os.makedirs(out_dir, exist_ok=True)
    
    final_wav = os.path.join(out_dir, "acto9_recreativas.wav")
    
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
        
    # 2. Combine all with delays onto a background noise track (8-bit arcade noise / synthwave hum)
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"anoisesrc=c=pink:r=48000:a=0.05:duration={BG_NOISE_SEC}",
        "-f", "lavfi", "-i", f"sine=frequency=120:duration={BG_NOISE_SEC}"
    ]
    
    for d in dialogues:
        filt_wav = os.path.join(tmp_dir, f"{d['id']}_filt.wav")
        ffmpeg_cmd.extend(["-i", filt_wav])
        
    filter_complex = ""
    # Add delays
    for i, d in enumerate(dialogues):
        idx = i + 2 # indices 0 and 1 are bg noise
        filter_complex += f"[{idx}:a]adelay={d['delay_ms']}|{d['delay_ms']}[aud{i}]; "
        
    # Mix background noises (add a square wave modulation to the background)
    filter_complex += "[0:a]volume=0.2[bg1]; [1:a]volume=0.1,tremolo=f=10:d=0.5[bg2]; [bg1][bg2]amix=inputs=2[bg]; "
    
    # Mix everything
    amix_inputs = "[bg]" + "".join([f"[aud{i}]" for i in range(len(dialogues))])
    filter_complex += f"{amix_inputs}amix=inputs={len(dialogues) + 1}:normalize=0[out]"
    
    ffmpeg_cmd.extend(["-filter_complex", filter_complex, "-map", "[out]", "-t", str(BG_NOISE_SEC), final_wav])
    
    print("Running FFmpeg combination...")
    subprocess.run(ffmpeg_cmd, check=True)
    
    # 3. Export subtitles JSON
    subs_json = "src/subtitles_acto9.json"
    with open(subs_json, "w", encoding="utf-8") as f:
        json.dump(dialogues, f, indent=4, ensure_ascii=False)
        
    print(f"ACTO 9 AUDIO DONE. Duration: {BG_NOISE_SEC}s")

if __name__ == "__main__":
    main()
