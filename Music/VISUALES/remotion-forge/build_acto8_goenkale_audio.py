import os
import subprocess
import json
import uuid

BG_NOISE_SEC = 95.0

dialogues = [
    {
        "id": "a8_01_pantoja",
        "voice": "Paulina",
        "text": "¡Cagüen la leche! ¿Por qué huele a azufre y a marmitako quemado? ¡Esto no es la taberna de mi Paquirri!",
        "ffmpeg_filter": "volume=2.0,asetrate=44100*1.1,atempo=0.9,aecho=0.8:0.9:50:0.3,chorus=0.5:0.9:50:0.4:0.25:2",
        "delay_ms": 500,
        "avatar": "pantoja"
    },
    {
        "id": "a8_02_piccolo",
        "voice": "Jorge",
        "text": "¡Silencio, terrícola! Siento un Ki maligno de baja frecuencia. Estamos atrapados en una dimensión de 480 líneas de resolución entrelazada... ¡Es Goenkale!",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*0.8,atempo=1.2,aecho=0.8:0.8:100:0.5",
        "delay_ms": 8000,
        "avatar": "piccolo"
    },
    {
        "id": "a8_03_pirri",
        "voice": "Jorge",
        "text": "¡Joder, yo paso de salir en la ETB1! ¡Me van a doblar la voz con acento de Bilbao! ¡Rajadle el cuello al tubo catódico!",
        "ffmpeg_filter": "volume=2.5,asetrate=44100*0.9,atempo=1.1,vibrato=f=8:d=0.3,aecho=0.8:0.8:30:0.4",
        "delay_ms": 17000,
        "avatar": "pirri"
    },
    {
        "id": "a8_04_piccolo",
        "voice": "Jorge",
        "text": "¡No os preocupéis! ¡Makankosappo! ... ¡Maldición, los píxeles rebotan mi ataque! ¡Nuestra energía no sirve contra guionistas vascos de los noventa!",
        "ffmpeg_filter": "volume=4.0,asetrate=44100*0.8,atempo=1.2,aecho=0.8:0.8:200:0.6,flanger=delay=5:depth=4",
        "delay_ms": 25000,
        "avatar": "piccolo"
    },
    {
        "id": "a8_05_pablo",
        "voice": "Diego",
        "text": "A ver, a ver, relajaos. Mira, lo que os pasa es que habéis firmado a tipo variable. Yo a Pedro le dije: pilla el Euribor ahora que está bajo, que te compras la cueva a interés fijo y te olvidas.",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*1.0,atempo=1.0,aecho=0.8:0.8:20:0.2",
        "delay_ms": 36000,
        "avatar": "pablo"
    },
    {
        "id": "a8_06_fijoman",
        "voice": "Diego",
        "text": "¡Cállate ya, tapón de piedra! ¡Nos estás durmiendo! ¡Saca una llave del 12 que reviento la televisión a hostias!",
        "ffmpeg_filter": "volume=3.0,acrusher=bits=8,asetrate=44100*0.9,atempo=1.1,tremolo=f=30:d=0.4,aecho=0.8:0.8:20:0.5",
        "delay_ms": 49000,
        "avatar": "fijoman"
    },
    {
        "id": "a8_07_pablo",
        "voice": "Diego",
        "text": "Que sí, que sí, tú pega hostias, pero cuando te llegue el recibo del IBI del televisor vas a llorar. Además, mi SEAT Ibiza gasta mucho menos que tu llave fija.",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*1.0,atempo=1.0,aecho=0.8:0.8:20:0.2",
        "delay_ms": 57000,
        "avatar": "pablo"
    },
    {
        "id": "a8_08_chimo",
        "voice": "Jorge",
        "text": "¡Hu-ha! ¡El IBI me lo paso yo por los huevos! ¡Vámonos de ruta por los circuitos impresos, chiquitan chiquititan!",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*1.1,atempo=0.9,flanger=delay=5:depth=4,aphaser=type=t:speed=2,extrastereo=m=2",
        "delay_ms": 68000,
        "avatar": "chimo_bayo"
    },
    {
        "id": "a8_09_gon",
        "voice": "Diego",
        "text": "¡Chavales, dejad de llorar por Goenkale! Me acabo de comprar un puto tándem para ir con mi perro. ¡Montaos, que nos vamos cagando hostias a buscar carajillos a Benidorm!",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*1.05,atempo=0.95,aecho=0.8:0.9:50:0.4",
        "delay_ms": 78000,
        "avatar": "gon_tandem"
    }
]

def main():
    tmp_dir = "/tmp/acto8_goenkale_audio"
    os.makedirs(tmp_dir, exist_ok=True)
    
    out_dir = "public"
    os.makedirs(out_dir, exist_ok=True)
    
    final_wav = os.path.join(out_dir, "acto8_goenkale.wav")
    
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
        
    # 2. Combine all with delays onto a background noise track (TV static simulation)
    # Background: low frequency noise for CRT hum + some static
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"anoisesrc=c=pink:r=48000:a=0.05:duration={BG_NOISE_SEC}",
        "-f", "lavfi", "-i", f"sine=frequency=60:duration={BG_NOISE_SEC}"
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
    filter_complex += "[0:a]volume=0.2[bg1]; [1:a]volume=0.1[bg2]; [bg1][bg2]amix=inputs=2[bg]; "
    
    # Mix everything
    amix_inputs = "[bg]" + "".join([f"[aud{i}]" for i in range(len(dialogues))])
    filter_complex += f"{amix_inputs}amix=inputs={len(dialogues) + 1}:normalize=0[out]"
    
    ffmpeg_cmd.extend(["-filter_complex", filter_complex, "-map", "[out]", "-t", str(BG_NOISE_SEC), final_wav])
    
    print("Running FFmpeg combination...")
    subprocess.run(ffmpeg_cmd, check=True)
    
    # 3. Export subtitles JSON
    subs_json = "src/subtitles_acto8.json"
    with open(subs_json, "w", encoding="utf-8") as f:
        json.dump(dialogues, f, indent=4, ensure_ascii=False)
        
    print(f"ACTO 8 AUDIO DONE. Duration: {BG_NOISE_SEC}s")

if __name__ == "__main__":
    main()
