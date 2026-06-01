import os
import subprocess
import json

BG_NOISE_SEC = 120.0

dialogues = [
    {
        "id": "a8_01_pablo",
        "voice": "Diego",
        "text": "Bienvenidos a la final.",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*1.0,atempo=1.0,aecho=0.8:0.8:20:0.2",
        "delay_ms": 2000,
        "avatar": "pablo"
    },
    {
        "id": "a8_02_piccolo",
        "voice": "Jorge",
        "text": "No es la final.",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*0.8,atempo=1.2,aecho=0.8:0.8:100:0.5",
        "delay_ms": 5000,
        "avatar": "piccolo"
    },
    {
        "id": "a8_03_pablo",
        "voice": "Diego",
        "text": "¿Qué es entonces?",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*1.0,atempo=1.0,aecho=0.8:0.8:20:0.2",
        "delay_ms": 7000,
        "avatar": "pablo"
    },
    {
        "id": "a8_04_piccolo",
        "voice": "Jorge",
        "text": "No lo sé.",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*0.8,atempo=1.2,aecho=0.8:0.8:100:0.5",
        "delay_ms": 9000,
        "avatar": "piccolo"
    },
    {
        "id": "a8_05_pablo",
        "voice": "Diego",
        "text": "Perfecto.",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*1.0,atempo=1.0,aecho=0.8:0.8:20:0.2",
        "delay_ms": 11000,
        "avatar": "pablo"
    },
    {
        "id": "a8_06_eddie",
        "voice": "Alvaro",
        "text": "Escuchadme bien. El ganador obtendrá el Carajillo Cuántico. El perdedor también.",
        "ffmpeg_filter": "volume=4.5,asetrate=44100*0.85,atempo=1.1,aecho=0.8:0.9:500:0.6",
        "delay_ms": 18000,
        "avatar": "eddie_morci"
    },
    {
        "id": "a8_07_pirri",
        "voice": "Jorge",
        "text": "¿Dónde caemos?",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*1.0,atempo=1.0,vibrato=f=5:d=0.3",
        "delay_ms": 30000,
        "avatar": "pirri"
    },
    {
        "id": "a8_08_juez",
        "voice": "Alvaro",
        "text": "Depende de tus traumas.",
        "ffmpeg_filter": "volume=4.0,asetrate=44100*0.7,atempo=1.3,aecho=1.0:1.0:100:0.8,flanger=delay=10:depth=5",
        "delay_ms": 33000,
        "avatar": "juez"
    },
    {
        "id": "a8_09_cunado17",
        "voice": "Diego",
        "text": "Yo habría ganado el Mundial de 2010 si me llegan a llamar.",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*1.1,atempo=0.9,aphaser=type=t:speed=1",
        "delay_ms": 42000,
        "avatar": "cunado17"
    },
    {
        "id": "a8_10_cunado43",
        "voice": "Diego",
        "text": "La gravedad está sobrevalorada.",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*0.9,atempo=1.1,aphaser=type=t:speed=2",
        "delay_ms": 47000,
        "avatar": "cunado43"
    },
    {
        "id": "a8_11_cunado89",
        "voice": "Diego",
        "text": "Tengo un primo que conoce a otro primo de Bruce Lee.",
        "ffmpeg_filter": "volume=3.5,asetrate=44100*1.2,atempo=0.8,aphaser=type=t:speed=2.0",
        "delay_ms": 51000,
        "avatar": "cunado89"
    },
    {
        "id": "a8_12_pantoja",
        "voice": "Paulina",
        "text": "¡Ay farola de mi aaalmaaa, llora conmigo este penar cuáááánticooo!",
        "ffmpeg_filter": "volume=4.5,asetrate=44100*1.3,atempo=0.6,vibrato=f=10:d=1,aecho=0.8:1.0:800:0.7,chorus=0.5:0.9:50:0.4:0.25:2",
        "delay_ms": 62000,
        "avatar": "pantoja"
    },
    {
        "id": "a8_13_medicos",
        "voice": "Jorge",
        "text": "Dictamen oficial: Lo que le dolía era el concepto.",
        "ffmpeg_filter": "volume=3.0,asetrate=44100*0.9,atempo=1.1,acrusher=bits=8,tremolo=f=10:d=0.5,aecho=0.8:0.8:20:0.5",
        "delay_ms": 75000,
        "avatar": "medicos"
    },
    {
        "id": "a8_14_xabi",
        "voice": "Monica",
        "text": "¡Nooooo! ¡Toda mi vida es una mentira!",
        "ffmpeg_filter": "volume=4.0,asetrate=44100*0.8,atempo=1.2,aecho=0.8:0.8:300:0.6,flanger=delay=20:depth=10",
        "delay_ms": 82000,
        "avatar": "xabi_cabezas"
    },
    {
        "id": "a8_15_nota",
        "voice": "Alvaro",
        "text": "Volvemos en 20 minutos. Estamos desayunando.",
        "ffmpeg_filter": "volume=4.5,asetrate=44100*0.9,atempo=1.1,aecho=0.8:0.9:500:0.6,acrusher=bits=4",
        "delay_ms": 95000,
        "avatar": "nota"
    },
    {
        "id": "a8_16_voz_lejana",
        "voice": "Elvira",
        "text": "El carajillo nunca fue el premio. Era la excusa.",
        "ffmpeg_filter": "volume=5.0,asetrate=44100*0.5,atempo=2.0,aphaser=type=t:speed=2,aecho=1:1:200:0.8,chorus=0.5:0.9:50:0.4:0.25:2",
        "delay_ms": 110000,
        "avatar": "voz_lejana"
    }
]

def main():
    tmp_dir = "/tmp/acto8_torneo_audio"
    os.makedirs(tmp_dir, exist_ok=True)
    
    out_dir = "public"
    os.makedirs(out_dir, exist_ok=True)
    
    final_wav = os.path.join(out_dir, "acto8_torneo.wav")
    
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
            "-af", d["ffmpeg_filter"] + ",aecho=0.8:0.8:250:0.4" if d["id"] == "a8_06_eddie" else d["ffmpeg_filter"],
            filt_wav
        ]
        subprocess.run(ff_cmd, check=True)
        
    # 2. Combine all with delays onto a background noise track (Stadium echo / Epic drone)
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"anoisesrc=c=pink:r=48000:a=0.05:duration={BG_NOISE_SEC}",
        "-f", "lavfi", "-i", f"sine=frequency=40:duration={BG_NOISE_SEC}"
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
    filter_complex += "[0:a]volume=0.2[bg1]; [1:a]volume=0.3[bg2]; [bg1][bg2]amix=inputs=2[bg]; "
    
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
