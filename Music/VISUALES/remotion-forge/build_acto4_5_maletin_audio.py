import os
import subprocess
import json

BG_NOISE_SEC = 100.0

dialogues = [
    {
        "id": "a45_01_narrator",
        "voice": "Alvaro",
        "text": "En Burgos existía una ley. Nunca persigas una gallina con un maletín. Nadie recordaba por qué.",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*0.9,atempo=1.1,aecho=0.8:0.9:50:0.5",
        "delay_ms": 10000,
        "avatar": "narrator"
    },
    {
        "id": "a45_02_grada",
        "voice": "Jorge",
        "text": "¡TUM-BAN-BAN! ¡TUM-BAN-BAN!",
        "ffmpeg_filter": "volume=4.0,chorus=0.7:0.9:55:0.4:0.25:2,aecho=0.8:0.8:300:0.5,flanger=delay=20:depth=5",
        "delay_ms": 25000,
        "avatar": "grada_bayo"
    },
    {
        "id": "a45_03_piccolo",
        "voice": "Jorge",
        "text": "¡Te tengo, espía interplanetario! ¡Habla, o te mandaré a la dimensión del vacío!",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*0.8,atempo=1.2,aecho=0.8:0.8:100:0.5",
        "delay_ms": 35000,
        "avatar": "piccolo"
    },
    {
        "id": "a45_04_pablo",
        "voice": "Diego",
        "text": "Hombre, verde, tampoco te pongas así. Si quieres hacer networking, invítame a un café primero. ¿Tú cómo ves lo del Euríbor?",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*1.0,atempo=1.0,aecho=0.8:0.8:20:0.2",
        "delay_ms": 42000,
        "avatar": "pablo"
    },
    {
        "id": "a45_05_pantoja",
        "voice": "Paulina",
        "text": "¡Aaaaahhh! ¡Ooooohhh! ¡Fígaroooo, cuánticoooo, lalalalaaaaa!",
        "ffmpeg_filter": "volume=4.0,asetrate=44100*1.5,atempo=0.6,vibrato=f=12:d=1,aecho=0.8:0.9:500:0.5,chorus=0.5:0.9:50:0.4:0.25:2,acrusher=bits=8",
        "delay_ms": 52000,
        "avatar": "pantoja"
    },
    {
        "id": "a45_06_carajillo_pirri",
        "voice": "Elvira",
        "text": "Compra Dogecoin...",
        "ffmpeg_filter": "volume=5.0,asetrate=44100*0.5,atempo=2.0,aphaser=type=t:speed=2,aecho=1:1:200:0.8",
        "delay_ms": 60000,
        "avatar": "carajillo"
    },
    {
        "id": "a45_07_carajillo_piccolo",
        "voice": "Elvira",
        "text": "Namek nunca existió...",
        "ffmpeg_filter": "volume=5.0,asetrate=44100*0.5,atempo=2.0,aphaser=type=t:speed=2,aecho=1:1:200:0.8",
        "delay_ms": 64000,
        "avatar": "carajillo"
    },
    {
        "id": "a45_08_carajillo_xabi",
        "voice": "Elvira",
        "text": "No era el escafoides...",
        "ffmpeg_filter": "volume=5.0,asetrate=44100*0.5,atempo=2.0,aphaser=type=t:speed=2,aecho=1:1:200:0.8",
        "delay_ms": 68000,
        "avatar": "carajillo"
    },
    {
        "id": "a45_09_carajillo_melendi",
        "voice": "Elvira",
        "text": "El parkour eres tú...",
        "ffmpeg_filter": "volume=5.0,asetrate=44100*0.5,atempo=2.0,aphaser=type=t:speed=2,aecho=1:1:200:0.8",
        "delay_ms": 72000,
        "avatar": "carajillo"
    },
    {
        "id": "a45_10_carajillo_fijoman",
        "voice": "Elvira",
        "text": "La verdadera llave era interior...",
        "ffmpeg_filter": "volume=5.0,asetrate=44100*0.5,atempo=2.0,aphaser=type=t:speed=2,aecho=1:1:200:0.8",
        "delay_ms": 76000,
        "avatar": "carajillo"
    },
    {
        "id": "a45_11_fijoman",
        "voice": "Diego",
        "text": "¡Me cago en la puta! ¡A mí no me vengas con gilipolleces de autoayuda, cajita de los cojones!",
        "ffmpeg_filter": "volume=3.0,acrusher=bits=8,asetrate=44100*0.9,atempo=1.1,tremolo=f=30:d=0.4,aecho=0.8:0.8:20:0.5",
        "delay_ms": 80000,
        "avatar": "fijoman"
    },
    {
        "id": "a45_12_chimo_gigante",
        "voice": "Jorge",
        "text": "¿Y SI EL MALETÍN ESTABA DENTRO DE NOSOTROS TODO ESTE TIEMPO?",
        "ffmpeg_filter": "volume=5.0,asetrate=44100*0.6,atempo=1.5,aecho=0.8:0.9:800:0.7,flanger=delay=20:depth=10",
        "delay_ms": 87000,
        "avatar": "chimo_gigante"
    },
    {
        "id": "a45_13_pablo_final",
        "voice": "Diego",
        "text": "Eso no tiene ningún sentido.",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*1.0,atempo=1.0,aecho=0.8:0.8:20:0.2",
        "delay_ms": 95000,
        "avatar": "pablo"
    }
]

def main():
    tmp_dir = "/tmp/acto4_5_maletin_audio"
    os.makedirs(tmp_dir, exist_ok=True)
    
    out_dir = "public"
    os.makedirs(out_dir, exist_ok=True)
    
    final_wav = os.path.join(out_dir, "acto4_5_maletin.wav")
    
    # 1. Generate base TTS and filter
    for d in dialogues:
        raw_aiff = os.path.join(tmp_dir, f"{d['id']}_raw.aiff")
        filt_wav = os.path.join(tmp_dir, f"{d['id']}_filt.wav")
        
        # macOS say
        tts_cmd = [
            "say",
            "-v", d['voice'],
            "-o", raw_aiff,
            d["text"]
        ]
        subprocess.run(tts_cmd, check=True)
        
        # FFmpeg filter
        ff_cmd = [
            "ffmpeg", "-y", "-i", raw_aiff,
            "-af", d["ffmpeg_filter"],
            filt_wav
        ]
        subprocess.run(ff_cmd, check=True)
        
    # 2. Combine all with delays onto a background noise track (TV static / rain simulation)
    # Background: rain (pink noise) + low rumble
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"anoisesrc=c=pink:r=48000:a=0.1:duration={BG_NOISE_SEC}",
        "-f", "lavfi", "-i", f"sine=frequency=50:duration={BG_NOISE_SEC}"
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
    subs_json = "src/subtitles_acto4_5.json"
    with open(subs_json, "w", encoding="utf-8") as f:
        json.dump(dialogues, f, indent=4, ensure_ascii=False)
        
    print(f"ACTO 4.5 AUDIO DONE. Duration: {BG_NOISE_SEC}s")

if __name__ == "__main__":
    main()
