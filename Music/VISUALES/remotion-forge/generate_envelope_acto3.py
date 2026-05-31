import json
import wave
import numpy as np

wav_path = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/public/friccion_acto3_dialogs.wav"
json_path = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/src/volume_envelope_acto3.json"

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
        raise ValueError("Unsupported sample width")
    
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
        # For int16, max amplitude is 32768
        # For int32, max amplitude is 2147483648
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
        
    print(f"Volume envelope generated successfully: {len(envelope)} frames written to {json_path}")
