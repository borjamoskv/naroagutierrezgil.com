'use client'

import { useEffect, useState } from 'react'

export default function SOTAFX() {
  const [pos, setPos] = useState({ x: -500, y: -500 })
  const [bgPos, setBgPos] = useState({ x: '50%', y: '50%' })
  const [hoveredSrc, setHoveredSrc] = useState<string | null>(null)
  
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array<ArrayBuffer> | null = null;
    let animationFrame: number;
    
    // 4 & 14. Sonido ASMR Taller + Audio Reactivity
    const playBrushSound = () => {
      try {
        if (!audioCtx) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtx = new AudioContextClass();
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 32;
          dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          const updateAudioReactivity = () => {
            if (analyser && dataArray) {
              analyser.getByteFrequencyData(dataArray as any);
              let sum = 0;
              for(let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              // Map 0-255 to 0-0.03
              const scalePulse = avg / 255 * 0.03;
              document.documentElement.style.setProperty('--audio-pulse', scalePulse.toString());
            }
            animationFrame = requestAnimationFrame(updateAudioReactivity);
          };
          updateAudioReactivity();
        }
        
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const bufferSize = audioCtx.sampleRate * 0.15;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize / 3));
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const bandpass = audioCtx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 6000;
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime); // ASMR supersutil
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        
        noise.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(analyser!);
        analyser!.connect(audioCtx.destination);
        noise.start();
      } catch {
        // ignore audio errors
      }
    };

    // Lupa, 3D Tilt y Eye-Tracking (13)
    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      
      // Eye-Tracking parallax for all gallery images
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const moveX = ((e.clientX / windowWidth) - 0.5) * 12; // -6% to +6%
      const moveY = ((e.clientY / windowHeight) - 0.5) * 12;
      document.documentElement.style.setProperty('--eye-x', `${50 + moveX}%`);
      document.documentElement.style.setProperty('--eye-y', `${50 + moveY}%`);

      const target = e.target as HTMLElement;
      const group = target.closest('.group') as HTMLElement;
      
      if (group) {
        const rect = group.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setBgPos({ x: `${x}%`, y: `${y}%` });

        // 3D Tilt + Audio Pulse
        const tiltX = (0.5 - (e.clientY - rect.top) / rect.height) * 25; 
        const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 25;
        group.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(calc(1.05 + var(--audio-pulse, 0)), calc(1.05 + var(--audio-pulse, 0)), 1)`;
      }
    }

    const onMouseEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const img = target.querySelector('img');
      if (img) setHoveredSrc(img.src);
      playBrushSound();
    }

    const onMouseLeave = (e: Event) => {
      setHoveredSrc(null);
      const target = e.currentTarget as HTMLElement;
      target.style.transform = '';
    }

    window.addEventListener('mousemove', onMouseMove)
    
    const galleryItems = document.querySelectorAll('#galeria .group');
    galleryItems.forEach(item => {
      item.addEventListener('mouseenter', onMouseEnter)
      item.addEventListener('mouseleave', onMouseLeave)
    })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      galleryItems.forEach(item => {
        item.removeEventListener('mouseenter', onMouseEnter)
        item.removeEventListener('mouseleave', onMouseLeave)
      })
      if (animationFrame) cancelAnimationFrame(animationFrame);
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        #galeria .group img {
          object-position: var(--eye-x, 50%) var(--eye-y, 50%);
          transition: object-position 0.1s ease-out;
          transform: scale(calc(1 + var(--scroll-velocity, 0) * 0.04));
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #galeria .group {
          transform: skewY(calc(var(--scroll-velocity, 0) * var(--scroll-direction, 0) * -1.8deg)) scale3d(calc(1 + var(--audio-pulse, 0)), calc(1 + var(--audio-pulse, 0)), 1);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #galeria .group:hover {
          transition: transform 0.1s ease-out;
        }
      `}} />

      {/* Lupa Magnética */}
      {hoveredSrc && (
        <div 
          className="fixed pointer-events-none z-[200] w-56 h-56 rounded-full border-2 border-primary/30 shadow-[0_0_40px_rgba(198,168,124,0.15)] bg-no-repeat transition-opacity duration-300 hidden md:block"
          style={{
            left: pos.x - 112,
            top: pos.y - 112,
            backgroundImage: `url(${hoveredSrc})`,
            backgroundSize: '250%', 
            backgroundPosition: `${bgPos.x} ${bgPos.y}`,
          }}
        />
      )}
    </>
  )
}
