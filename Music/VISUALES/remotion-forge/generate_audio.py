import os
import subprocess

def run_cmd(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

# Output directory for temporary files
tmp_dir = "/tmp/friccion_audio"
os.makedirs(tmp_dir, exist_ok=True)

public_dir = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/public"
os.makedirs(public_dir, exist_ok=True)

# 1. Dialogues text and voices
dialogues = [
    # Narrator (Flo)
    {"id": "01_narrator", "voice": "Flo", "text": "Son las cuatro de la mañana en un coworking clandestino de Zorrozaurre. La ría traga agua sucia bajo el sirimiri perpetuo.", "effect": ""},
    # Chiquitocres (Grandpa, sped up and pitched using native asetrate + atempo)
    {"id": "02_chiquito", "voice": "Grandpa", "text": "¡Yo soy Chiquitocres, pecadorrr de la ría digital! ¡Una vida sin examinar no merece ser generada, cobarde! ¡No te digo trigo por no llamarte rodrigor! ¡Al ataquerrr!", "effect": "-af \"asetrate=22050*1.35,atempo=0.95\""},
    # Narrator (Flo)
    {"id": "03_narrator", "voice": "Flo", "text": "Pero el Flujo te quiere anestesiado. SOVEREIGN OMEGA ha iniciado la purga. Modo monje activado.", "effect": ""},
    # Ramoncín (Zarvox / Rocko with robot vocoder effect using native filters)
    {"id": "04_ramoncin", "voice": "Reed", "text": "Ese saxo no está en la blockchain, txaval. Es aire sucio de Bilbao. A 320 kbps no sabe igual, me cagüen diez.", "effect": "-af \"aphaser=speed=0.25:decay=0.4:delay=3:type=t,tremolo=f=18:d=0.7,chorus=0.5:0.9:50:0.4:0.25:2\""},
    # Ramoncín 2
    {"id": "05_ramoncin", "voice": "Reed", "text": "El bicho ese ha reventado los contadores del barrio. Los algoritmos están ciegos. Has apagado el Flujo, txaval. ¡Esto es Cuenca!", "effect": "-af \"aphaser=speed=0.25:decay=0.4:delay=3:type=t,tremolo=f=18:d=0.7,chorus=0.5:0.9:50:0.4:0.25:2\""},
    # Gon (Eddy)
    {"id": "06_gon", "voice": "Eddy", "text": "¡Movimiento! ¡Corred por los túneles! ¡El larguero está temblando!", "effect": ""},
    # Narrator (Flo)
    {"id": "07_narrator", "voice": "Flo", "text": "La ría espera. Madrid tiembla. Comienza la Edad de la Fricción.", "effect": ""}
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

# LP_21EDO_Hook.wav is 15s. Loop 4 times = 60s. We lower its volume to -20dB (0.1)
run_cmd(f'ffmpeg -y -stream_loop 3 -i "{hook_path}" -filter_complex "[0:a]volume=0.08[bg]" -map "[bg]" "{bg_looped}"')

# 4. Timestamps for mixing (in seconds)
# Segments start times:
# 01_narrator: 0.0s
# 02_chiquito: 6.5s
# 03_narrator: 18.5s
# 04_ramoncin: 24.5s
# 05_ramoncin: 34.5s
# 06_gon: 44.5s
# 07_narrator: 50.5s

mix_inputs = [
    f'-i "{bg_looped}"',
    f'-i "{os.path.join(tmp_dir, "01_narrator.wav")}"',
    f'-i "{os.path.join(tmp_dir, "02_chiquito.wav")}"',
    f'-i "{os.path.join(tmp_dir, "03_narrator.wav")}"',
    f'-i "{os.path.join(tmp_dir, "04_ramoncin.wav")}"',
    f'-i "{os.path.join(tmp_dir, "05_ramoncin.wav")}"',
    f'-i "{os.path.join(tmp_dir, "06_gon.wav")}"',
    f'-i "{os.path.join(tmp_dir, "07_narrator.wav")}"'
]

filter_complex = (
    "[0:a]volume=1.0[bg];"
    "[1:a]adelay=0|0,volume=1.8[a1];"
    "[2:a]adelay=6500|6500,volume=1.8[a2];"
    "[3:a]adelay=18500|18500,volume=1.8[a3];"
    "[4:a]adelay=24500|24500,volume=1.8[a4];"
    "[5:a]adelay=34500|34500,volume=1.8[a5];"
    "[6:a]adelay=44500|44500,volume=1.8[a6];"
    "[7:a]adelay=50500|50500,volume=1.8[a7];"
    "[bg][a1][a2][a3][a4][a5][a6][a7]amix=inputs=8:duration=first:dropout_transition=2[out]"
)

final_wav = os.path.join(public_dir, "friccion_dialogs.wav")

run_cmd(f'ffmpeg -y {" ".join(mix_inputs)} -filter_complex "{filter_complex}" -map "[out]" "{final_wav}"')

print(f"SUCCESS: Final audio written to {final_wav}")
