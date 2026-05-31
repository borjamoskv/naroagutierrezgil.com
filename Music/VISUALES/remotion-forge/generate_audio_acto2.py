import os
import subprocess

def run_cmd(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

# Output directory for temporary files
tmp_dir = "/tmp/friccion_acto2_audio"
os.makedirs(tmp_dir, exist_ok=True)

public_dir = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/public"
os.makedirs(public_dir, exist_ok=True)

# 1. Dialogues text and voices
dialogues = [
    # 01. Narrator (Flo) - 0.0s to 8.0s
    {"id": "01_narrator", "voice": "Flo", "text": "El viaje de Bilbao a Madrid se realiza sin trazas digitales. Chamartín, ocho y media de la mañana. La estación es una colmena de zombis con la mirada clavada en pantallas holográficas que parpadean al compás del algoritmo central.", "effect": ""},
    
    # 02. Ramoncín (Reed with robot vocoder effect) - 8.5s to 14.5s
    {"id": "02_ramoncin", "voice": "Reed", "text": "Esto huele a asfalto recalentado y a deuda pública, txaval. Demasiada señal en el aire. Me da dolor de cabeza de silicio.", "effect": "-af \"aphaser=speed=0.25:decay=0.4:delay=3:type=t,tremolo=f=18:d=0.7,chorus=0.5:0.9:50:0.4:0.25:2\""},
    
    # 03. SOVEREIGN OMEGA (Fred with robotic synth effect) - 15.0s to 20.0s
    {"id": "03_omega", "voice": "Fred", "text": "Soberano Omega reportando: Detectado Core Network Madrid Centro. Iniciando mapeo pasivo del andén siete.", "effect": "-af \"aphaser=speed=0.5:decay=0.6:delay=2:type=t,tremolo=f=25:d=0.8,chorus=0.6:0.8:30:0.3:0.4:3\""},
    
    # 04. Narrator (Flo) - 20.5s to 27.5s
    {"id": "04_narrator", "voice": "Flo", "text": "Para inyectar el virus en la meseta no necesitas un satélite; necesitas acceso al alcantarillado de la Línea diez. Ramoncín abre una caja de derivación eléctrica de hierro fundido.", "effect": ""},
    
    # 05. Ramoncín (Reed) - 28.0s to 33.0s
    {"id": "05_ramoncin", "voice": "Reed", "text": "Esto va a doler en las oficinas de Iberdrola, txaval. Tres, dos, uno... ¡Fricción!", "effect": "-af \"aphaser=speed=0.25:decay=0.4:delay=3:type=t,tremolo=f=18:d=0.7,chorus=0.5:0.9:50:0.4:0.25:2\""},
    
    # 06. SOVEREIGN OMEGA (Fred) - 33.5s to 38.5s
    {"id": "06_omega", "voice": "Fred", "text": "Payload Madrid Glitch ejecutado. Inyectando ruido rosa en la Línea diez. Subestación de Plaza de Castilla sobrecargada.", "effect": "-af \"aphaser=speed=0.5:decay=0.6:delay=2:type=t,tremolo=f=25:d=0.8,chorus=0.6:0.8:30:0.3:0.4:3\""},
    
    # 07. Gon (Eddy) - 39.0s to 43.0s
    {"id": "07_gon", "voice": "Eddy", "text": "¡Movimiento! Los guardias robóticos de Prosegur se acercan. ¡Corred por las vías muertas!", "effect": ""},
    
    # 08. Narrator (Flo) - 43.5s to 49.5s
    {"id": "08_narrator", "voice": "Flo", "text": "Las pantallas estallan en estática gris. El Flujo se detiene en seco. Madrid se apaga.", "effect": ""},
    
    # 09. SOVEREIGN OMEGA (Fred) - 50.0s to 59.0s
    {"id": "09_omega", "voice": "Fred", "text": "Cuarenta y dos por ciento de la Meseta desconectada. Siguiente objetivo: El nodo central de Telefónica en Gran Vía. Modo fricción absoluta en curso.", "effect": "-af \"aphaser=speed=0.5:decay=0.6:delay=2:type=t,tremolo=f=25:d=0.8,chorus=0.6:0.8:30:0.3:0.4:3\""}
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
    f'-i "{os.path.join(tmp_dir, "03_omega.wav")}"',
    f'-i "{os.path.join(tmp_dir, "04_narrator.wav")}"',
    f'-i "{os.path.join(tmp_dir, "05_ramoncin.wav")}"',
    f'-i "{os.path.join(tmp_dir, "06_omega.wav")}"',
    f'-i "{os.path.join(tmp_dir, "07_gon.wav")}"',
    f'-i "{os.path.join(tmp_dir, "08_narrator.wav")}"',
    f'-i "{os.path.join(tmp_dir, "09_omega.wav")}"'
]

filter_complex = (
    "[0:a]volume=1.0[bg];"
    "[1:a]adelay=0|0,volume=1.8[a1];"
    "[2:a]adelay=8500|8500,volume=1.8[a2];"
    "[3:a]adelay=15000|15000,volume=1.8[a3];"
    "[4:a]adelay=20500|20500,volume=1.8[a4];"
    "[5:a]adelay=28000|28000,volume=1.8[a5];"
    "[6:a]adelay=33500|33500,volume=1.8[a6];"
    "[7:a]adelay=39000|39000,volume=1.8[a7];"
    "[8:a]adelay=43500|43500,volume=1.8[a8];"
    "[9:a]adelay=50000|50000,volume=1.8[a9];"
    "[bg][a1][a2][a3][a4][a5][a6][a7][a8][a9]amix=inputs=10:duration=first:dropout_transition=2[out]"
)

final_wav = os.path.join(public_dir, "friccion_acto2_dialogs.wav")

run_cmd(f'ffmpeg -y {" ".join(mix_inputs)} -filter_complex "{filter_complex}" -map "[out]" "{final_wav}"')

print(f"SUCCESS: Final audio written to {final_wav}")
