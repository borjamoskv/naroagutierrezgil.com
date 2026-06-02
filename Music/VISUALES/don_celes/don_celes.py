import os
import sys
import json
import argparse
from pathlib import Path

try:
    import librosa
    import numpy as np
except ImportError:
    print("CRITICAL: Faltan dependencias. Ejecuta: pip install librosa numpy")
    sys.exit(1)

# ==============================================================================
# DON CELES - Remotion JIT Audio-AST Compiler
# STATE: C5-REAL
# ==============================================================================

def extract_audio_features(audio_path, fps=30):
    print(f"[*] Don Celes: Extrayendo topología de {audio_path} a {fps} FPS...")
    
    # Cargar audio
    y, sr = librosa.load(audio_path, sr=None)
    
    # Calcular hop_length para coincidir con los FPS de Remotion
    hop_length = int(sr / fps)
    
    # Extraer energía (RMS)
    rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
    # Normalizar RMS entre 0 y 1
    rms_norm = rms / np.max(rms) if np.max(rms) > 0 else rms
    
    # Extraer Onset Envelope (Golpes/Beats)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)
    onset_norm = onset_env / np.max(onset_env) if np.max(onset_env) > 0 else onset_env
    
    # Convertir a lista nativa para JSON
    energy_data = [round(float(val), 4) for val in rms_norm]
    beats_data = [round(float(val), 4) for val in onset_norm]
    
    duration_sec = len(y) / sr
    total_frames = int(duration_sec * fps)
    
    # Ajustar longitudes para coincidir con total_frames exactamente
    energy_data = energy_data[:total_frames] + [0.0] * max(0, total_frames - len(energy_data))
    beats_data = beats_data[:total_frames] + [0.0] * max(0, total_frames - len(beats_data))
    
    return {
        "fps": fps,
        "durationInFrames": total_frames,
        "energy": energy_data,
        "beats": beats_data
    }

def generate_remotion_tsx(out_dir, audio_file_name, data_file_name="audio_data.json"):
    tsx_content = f"""import React from 'react';
import {{ AbsoluteFill, Audio, useCurrentFrame, staticFile }} from 'remotion';
import audioData from './{data_file_name}';

// ==============================================================================
// GENERADO POR DON CELES (C5-REAL)
// ==============================================================================

export const DonCelesScene: React.FC = () => {{
  const frame = useCurrentFrame();
  
  // Seguridad: clamp de frames
  const safeFrame = Math.min(frame, audioData.durationInFrames - 1);
  
  const energy = audioData.energy[safeFrame] || 0;
  const beat = audioData.beats[safeFrame] || 0;

  // Transformaciones Topológicas
  // Multiplicamos por la energía y beats precalculados en Python (Cero fricción en JS)
  const scale = 1 + (beat * 0.5); 
  const opacity = 0.5 + (energy * 0.5);

  return (
    <AbsoluteFill style={{{{ backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }}}}>
      {/* Carga del audio nativo para que suene */}
      <Audio src={{staticFile("{audio_file_name}")}} />
      
      {/* Elemento visual reaccionando */}
      <div
        style={{{{
          width: '300px',
          height: '300px',
          backgroundColor: '#2B3BE5',
          borderRadius: '50%',
          transform: `scale(${{scale}})`,
          opacity: opacity,
          boxShadow: `0 0 ${{beat * 100}}px #2B3BE5`,
          transition: 'none', // Animación per-frame pura
        }}}}
      />
      
      {/* HUD Industrial Noir */}
      <div style={{{{ position: 'absolute', bottom: 40, left: 40, color: 'white', fontFamily: 'monospace', fontSize: 24 }}}}>
        FRAME: {{frame}} | ENERGY: {{energy.toFixed(3)}} | BEAT: {{beat.toFixed(3)}}
      </div>
    </AbsoluteFill>
  );
}};
"""
    tsx_path = out_dir / "DonCelesScene.tsx"
    with open(tsx_path, "w") as f:
        f.write(tsx_content)
    print(f"[+] TSX generado exitosamente: {tsx_path}")


def main():
    parser = argparse.ArgumentParser(description="Don Celes - Remotion AST Audio Injector")
    parser.add_argument("audio_path", help="Ruta al archivo de audio (wav/mp3)")
    parser.add_argument("--fps", type=int, default=30, help="Frames per second del video")
    parser.add_argument("--out", type=str, default="./don_celes_out", help="Directorio de salida")
    args = parser.parse_args()

    audio_path = Path(args.audio_path)
    if not audio_path.exists():
        print(f"ERROR: No se encuentra el archivo {audio_path}")
        sys.exit(1)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1. Extraer features
    audio_data = extract_audio_features(str(audio_path), args.fps)
    
    # 2. Guardar JSON
    json_path = out_dir / "audio_data.json"
    with open(json_path, "w") as f:
        json.dump(audio_data, f)
    print(f"[+] Audio features (Topología) guardadas en {json_path}")

    # 3. Generar Código Remotion
    # Asumimos que el usuario copiará el audio a "public" de Remotion
    # Para el ejemplo, referenciamos solo el nombre del archivo
    generate_remotion_tsx(out_dir, audio_path.name)
    
    print("\n[✔] DON CELES HA TERMINADO (C5-REAL).")
    print("Instrucciones para Remotion:")
    print("1. Copia el archivo de audio a la carpeta 'public/' de Remotion.")
    print(f"2. Mueve 'audio_data.json' y 'DonCelesScene.tsx' a tu carpeta 'src/'.")
    print("3. Registra <Composition id=\"DonCeles\" component={DonCelesScene} ... /> usando los durationInFrames de audio_data.json")

if __name__ == "__main__":
    main()
