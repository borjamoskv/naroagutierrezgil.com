import json
import wave
import numpy as np
import os

configs = [
    {
        "wav": "friccion_dialogs.wav",
        "json": "volume_envelope.json"
    },
    {
        "wav": "friccion_acto2_dialogs.wav",
        "json": "volume_envelope_acto2.json"
    },
    {
        "wav": "friccion_acto3_dialogs.wav",
        "json": "volume_envelope_acto3.json"
    }
]

public_dir = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/public"
src_dir = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/src"

for config in configs:
    wav_path = os.path.join(public_dir, config["wav"])
    json_path = os.path.join(src_dir, config["json"])
    
    if not os.path.exists(wav_path):
        print(f"Skipping {config['wav']}: file does not exist")
        continue

    with wave.open(wav_path, 'rb') as w:
        params = w.getparams()
        nchannels, sampwidth, framerate, nframes = params[:4]
        
        # Read raw audio frames
        str_data = w.readframes(nframes)
        
        # Convert to numpy array based on sample width
        if sampwidth == 2:
            data = np.frombuffer(str_data, dtype=np.int16)
        elif sampwidth == 4:
            data = np.frombuffer(str_data, dtype=np.int32)
        elif sampwidth == 1:
            data = np.frombuffer(str_data, dtype=np.uint8) - 128
        else:
            raise ValueError(f"Unsupported sample width {sampwidth}")
        
        # If stereo, take mean of channels
        if nchannels == 2:
            data = data.reshape(-1, 2).mean(axis=1)
            
        # Calculate frames based on Remotion FPS (30)
        fps = 30
        samples_per_frame = int(framerate / fps)
        
        envelope = []
        
        for i in range(0, len(data), samples_per_frame):
            chunk = data[i:i+samples_per_frame]
            if len(chunk) == 0:
                envelope.append(0.0)
                continue
                
            # Normalize chunk and calculate RMS
            max_val = 32768.0 if sampwidth == 2 else 2147483648.0
            normalized = chunk / max_val
            
            rms = np.sqrt(np.mean(normalized**2))
            envelope.append(float(rms))
            
        # Normalize envelope to range 0.0 - 1.0
        max_rms = max(envelope) if len(envelope) > 0 else 1.0
        if max_rms > 0:
            envelope = [val / max_rms for val in envelope]
            
        with open(json_path, 'w') as f:
            json.dump(envelope, f)
            
        print(f"Volume envelope generated: {len(envelope)} frames written to {config['json']}")
