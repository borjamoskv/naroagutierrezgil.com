import os
import subprocess

def run_cmd(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

# Output directory for temporary files
tmp_dir = "/tmp/friccion_acto3_audio"
os.makedirs(tmp_dir, exist_ok=True)

public_dir = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/public"
os.makedirs(public_dir, exist_ok=True)

# 1. Dialogues text and voices
dialogues = [
    # 01. Narrator (Flo) - 0.0s to 7.5s
    {"id": "01_narrator", "voice": "Flo", "text": "La superficie de Madrid se ha quedado sin reflejo digital, pero Gran Vía sigue brillando como si nada hubiera pasado. Error elegante del sistema. No es resistencia: es inercia con presupuesto publicitario.", "effect": ""},
    
    # 02. Ramoncín (Reed with robot vocoder effect) - 8.5s to 13.5s
    {"id": "02_ramoncin", "voice": "Reed", "text": "No lo entiende, txaval. El Flujo aquí no depende de la red. Depende de la costumbre. Eso es peor.", "effect": "-af \"aphaser=speed=0.25:decay=0.4:delay=3:type=t,tremolo=f=18:d=0.7,chorus=0.5:0.9:50:0.4:0.25:2\""},
    
    # 03. Gon (Eddy) - 14.5s to 18.5s
    {"id": "03_gon", "voice": "Eddy", "text": "Esto no se hackea. Esto se atraviesa. Siente la vibración del mármol.", "effect": ""},
    
    # 04. Ramoncín (Reed) - 20.0s to 24.0s
    {"id": "04_ramoncin", "voice": "Reed", "text": "O se desajusta. Vamos a meterle ruido de verdad a su misa corporativa.", "effect": "-af \"aphaser=speed=0.25:decay=0.4:delay=3:type=t,tremolo=f=18:d=0.7,chorus=0.5:0.9:50:0.4:0.25:2\""},
    
    # 05. SOVEREIGN OMEGA (Fred) - 25.0s to 30.5s
    {"id": "05_omega", "voice": "Fred", "text": "Soberano Omega reportando: Anomalía detectada en Gran Vía. El sistema no falla, el sistema sueña. Iniciando desalineación física.", "effect": "-af \"aphaser=speed=0.5:decay=0.6:delay=2:type=t,tremolo=f=25:d=0.8,chorus=0.6:0.8:30:0.3:0.4:3\""},
    
    # 06. Narrator (Flo) - 31.5s to 37.5s
    {"id": "06_narrator", "voice": "Flo", "text": "Subsuelo menos tres. El core de Telefónica no está encendido, está despierto. Bloque de infraestructura biológica industrial.", "effect": ""},
    
    # 07. Ramoncín (Reed) - 38.5s to 42.5s
    {"id": "07_ramoncin", "voice": "Reed", "text": "Esto no lo apagas, txaval. Esto se negocia o se infecta.", "effect": "-af \"aphaser=speed=0.25:decay=0.4:delay=3:type=t,tremolo=f=18:d=0.7,chorus=0.5:0.9:50:0.4:0.25:2\""},
    
    # 08. SOVEREIGN OMEGA (Fred) - 43.5s to 49.5s
    {"id": "08_omega", "voice": "Fred", "text": "Sistema legado detectado. Protocolo no humano activo. Una estructura de pensamiento comprimida en señal dice: No sois los primeros.", "effect": "-af \"aphaser=speed=0.5:decay=0.6:delay=2:type=t,tremolo=f=25:d=0.8,chorus=0.6:0.8:30:0.3:0.4:3\""},
    
    # 09. SOVEREIGN OMEGA (Fred) - 50.5s to 58.5s
    {"id": "09_omega", "voice": "Fred", "text": "Capa analógica activa. Bienvenidos, arquitectos de segunda iteración. El Flujo evoluciona.", "effect": "-af \"aphaser=speed=0.5:decay=0.6:delay=2:type=t,tremolo=f=25:d=0.8,chorus=0.6:0.8:30:0.3:0.4:3\""}
]

# 2. Generate speech for each dialogue
for d in dialogues:
    aiff_path = os.path.join(tmp_dir, f"{d['id']}_raw.aiff")
    wav_path = os.path.join(tmp_dir, f"{d['id']}.wav")
    
    # Generate raw AIFF with 'say'
    run_cmd(f'say -v "{d["voice"]}" -o "{aiff_path}" "{d["text"]}"')
    
    # Convert and apply effect using ffmpeg
    effect_arg = d["effect"]
    run_cmd(f'ffmpeg -y -i "{aiff_path}" {effect_arg} -ar 44100 -ac 2 "{wav_path}"')

# 3. Create looped background track (60s) from LP_21EDO_Hook.wav
hook_path = "/Users/borjafernandezangulo/Music/VISUALES/LP_21EDO_Hook.wav"
bg_looped = os.path.join(tmp_dir, "bg_looped.wav")

# Loop 4 times = 60s. Low volume to -20dB (0.08)
run_cmd(f'ffmpeg -y -stream_loop 3 -i "{hook_path}" -filter_complex "[0:a]volume=0.08[bg]" -map "[bg]" "{bg_looped}"')

# 4. Mix everything
mix_inputs = [
    f'-i "{bg_looped}"',
    f'-i "{os.path.join(tmp_dir, "01_narrator.wav")}"',
    f'-i "{os.path.join(tmp_dir, "02_ramoncin.wav")}"',
    f'-i "{os.path.join(tmp_dir, "03_gon.wav")}"',
    f'-i "{os.path.join(tmp_dir, "04_ramoncin.wav")}"',
    f'-i "{os.path.join(tmp_dir, "05_omega.wav")}"',
    f'-i "{os.path.join(tmp_dir, "06_narrator.wav")}"',
    f'-i "{os.path.join(tmp_dir, "07_ramoncin.wav")}"',
    f'-i "{os.path.join(tmp_dir, "08_omega.wav")}"',
    f'-i "{os.path.join(tmp_dir, "09_omega.wav")}"'
]

filter_complex = (
    "[0:a]volume=1.0[bg];"
    "[1:a]adelay=0|0,volume=1.8[a1];"
    "[2:a]adelay=8500|8500,volume=1.8[a2];"
    "[3:a]adelay=14500|14500,volume=1.8[a3];"
    "[4:a]adelay=20000|20000,volume=1.8[a4];"
    "[5:a]adelay=25000|25000,volume=1.8[a5];"
    "[6:a]adelay=31500|31500,volume=1.8[a6];"
    "[7:a]adelay=38500|38500,volume=1.8[a7];"
    "[8:a]adelay=43500|43500,volume=1.8[a8];"
    "[9:a]adelay=50500|50500,volume=1.8[a9];"
    "[bg][a1][a2][a3][a4][a5][a6][a7][a8][a9]amix=inputs=10:duration=first:dropout_transition=2[out]"
)

final_wav = os.path.join(public_dir, "friccion_acto3_dialogs.wav")

run_cmd(f'ffmpeg -y {" ".join(mix_inputs)} -filter_complex "{filter_complex}" -map "[out]" "{final_wav}"')

print(f"SUCCESS: Final audio written to {final_wav}")
