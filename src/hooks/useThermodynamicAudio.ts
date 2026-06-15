'use client'

import { useEffect, useRef } from 'react'

export function useThermodynamicAudio() {
  const isInitialized = useRef(false);

  const playBrushSound = () => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64; 
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let bandpass: BiquadFilterNode;
      
      const updateAudioReactivity = () => {
        if (analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray);
          
          let lowSum = 0, midSum = 0, highSum = 0;
          const third = Math.floor(dataArray.length / 3);
          
          for(let i = 0; i < third; i++) lowSum += dataArray[i];
          for(let i = third; i < third * 2; i++) midSum += dataArray[i];
          for(let i = third * 2; i < dataArray.length; i++) highSum += dataArray[i];
          
          const low = (lowSum / third) / 255;
          const mid = (midSum / third) / 255;
          const high = (highSum / third) / 255;

          document.documentElement.style.setProperty('--audio-low', low.toString());
          document.documentElement.style.setProperty('--audio-mid', mid.toString());
          document.documentElement.style.setProperty('--audio-high', high.toString());
          
          if (bandpass) {
            const sv = parseFloat(document.documentElement.style.getPropertyValue('--scroll-velocity') || '0');
            bandpass.frequency.setTargetAtTime(4000 + sv * 4000, audioCtx.currentTime, 0.1);
          }
        }
        requestAnimationFrame(updateAudioReactivity);
      };
      
      updateAudioReactivity();
      
      if (audioCtx.state === 'suspended') audioCtx.resume();
      
      const bufferSize = audioCtx.sampleRate * 0.2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize / 4));
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      bandpass = audioCtx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 4000;
      bandpass.Q.value = 1.5;
      
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime); 
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
      
      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(analyser);
      analyser.connect(audioCtx.destination);
      noise.start();
      
      setTimeout(() => {
         isInitialized.current = false; // Allow trigger again later if needed
      }, 500);

    } catch {
      // ignore
    }
  };

  return { playBrushSound };
}