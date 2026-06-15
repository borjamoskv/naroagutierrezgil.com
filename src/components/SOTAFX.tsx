'use client'

import { useEffect, useState } from 'react'
import SplatVault from './SplatVault'

export default function SOTAFX() {
  const [pos, setPos] = useState({ x: -500, y: -500 })
  const [bgPos, setBgPos] = useState({ x: '50%', y: '50%' })
  const [hoveredSrc, setHoveredSrc] = useState<string | null>(null)
  const [vaultMode, setVaultMode] = useState(false)
  
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let bandpass: BiquadFilterNode | null = null;
    let animationFrame: number;
    let scrollFrame: number;
    
    const playBrushSound = () => {
      try {
        if (!audioCtx) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtx = new AudioContextClass();
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64; // High res for multiple bands
          dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          const updateAudioReactivity = () => {
            if (analyser && dataArray) {
              analyser.getByteFrequencyData(dataArray);
              
              // Thermodynamic Multi-Band Extraction
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
              
              // Doppler frequency shift based on scroll velocity (Thermodynamic Acoustic Coupling)
              if (bandpass) {
                const sv = parseFloat(document.documentElement.style.getPropertyValue('--scroll-velocity') || '0');
                bandpass.frequency.setTargetAtTime(4000 + sv * 4000, audioCtx.currentTime, 0.1);
              }
            }
            animationFrame = requestAnimationFrame(updateAudioReactivity);
          };
          updateAudioReactivity();
        }
        
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const bufferSize = audioCtx.sampleRate * 0.2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        // Generate heavily textured pink noise emulation
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize / 4));
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        if (!bandpass) {
          bandpass = audioCtx.createBiquadFilter();
          bandpass.type = 'bandpass';
          bandpass.frequency.value = 4000;
          bandpass.Q.value = 1.5;
        }
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime); 
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
        
        noise.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(analyser!);
        analyser!.connect(audioCtx.destination);
        noise.start();
      } catch {
        // ignore audio errors
      }
    };

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    
    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      
      scrollVelocity = scrollVelocity + (delta - scrollVelocity) * 0.12;
      
      const speed = Math.min(Math.abs(scrollVelocity) / 30, 1);
      const direction = Math.sign(scrollVelocity);
      
      document.documentElement.style.setProperty('--scroll-velocity', speed.toString());
      document.documentElement.style.setProperty('--scroll-direction', direction.toString());
      
      lastScrollY = currentScrollY;
      scrollFrame = requestAnimationFrame(updateScroll);
    };
    updateScroll();

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const moveX = ((e.clientX / windowWidth) - 0.5) * 12;
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

        // Zero-latency audio-reactive 3D transform mapping
        const lowPulse = parseFloat(document.documentElement.style.getPropertyValue('--audio-low') || '0') * 0.08;
        const tiltX = (0.5 - (e.clientY - rect.top) / rect.height) * 25; 
        const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 25;
        
        group.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${1.05 + lowPulse}, ${1.05 + lowPulse}, 1)`;
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
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        #galeria .group img {
          object-position: var(--eye-x, 50%) var(--eye-y, 50%);
          transition: object-position 0.1s ease-out;
          transform: scale(calc(1 + var(--scroll-velocity, 0) * 0.08));
          filter: saturate(calc(1 + var(--audio-high, 0) * 2.0)) brightness(calc(1 + var(--audio-mid, 0) * 0.5));
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.1s ease-out;
        }
        #galeria .group {
          /* Thermodynamic Audio-Scroll Sync Coupling */
          transform: skewY(calc((var(--scroll-velocity, 0) * var(--scroll-direction, 0) * -3.0deg) + (var(--audio-mid, 0) * 2deg))) scale3d(calc(1 + var(--audio-low, 0) * 0.04), calc(1 + var(--audio-low, 0) * 0.04), 1);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #galeria .group:hover {
          transition: transform 0.1s ease-out;
          box-shadow: 0 0 calc(var(--audio-low, 0) * 100px) rgba(255,51,102,0.4);
        }
      `}} />

      {/* Splat Volumetric Engine (Vault Mode) */}
      <SplatVault isVisible={vaultMode} />
      
      {/* Vault Mode Overlay Mask */}
      <div 
        className={\`fixed inset-0 z-[150] pointer-events-none bg-[#0a0a0c] transition-opacity duration-1000 \${vaultMode ? 'opacity-100' : 'opacity-0'}\`}
        style={{
          maskImage: \`radial-gradient(circle 350px at \${pos.x}px \${pos.y}px, transparent 0%, black 100%)\`,
          WebkitMaskImage: \`radial-gradient(circle 350px at \${pos.x}px \${pos.y}px, transparent 0%, black 100%)\`
        }}
      />

      {/* Vault Toggle Button */}
      <button 
        onClick={() => setVaultMode(!vaultMode)}
        className="fixed bottom-8 right-8 z-[250] px-4 py-2 border border-primary/50 text-primary bg-background/50 backdrop-blur font-sans uppercase tracking-[0.2em] text-[10px] hover:bg-primary hover:text-black transition-colors mix-blend-difference"
      >
        {vaultMode ? 'Encender Luces' : 'Modo Bóveda'}
      </button>

      {/* Lupa Magnética AWWWARDS */}
      {hoveredSrc && !vaultMode && (
        <div 
          className="fixed pointer-events-none z-[200] w-64 h-64 rounded-full border border-primary/20 bg-no-repeat hidden md:block overflow-hidden mix-blend-screen"
          style={{
            left: pos.x - 128,
            top: pos.y - 128,
            backgroundImage: \`url(\${hoveredSrc})\`,
            backgroundSize: '250%', 
            backgroundPosition: \`\${bgPos.x} \${bgPos.y}\`,
            boxShadow: '0 0 50px rgba(198,168,124,0.15), inset 0 0 30px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(198,168,124,0.4)',
            filter: 'contrast(1.15) saturate(1.1) drop-shadow(0 0 20px rgba(198,168,124,0.3))',
            transform: \`scale(calc(1 + var(--audio-low, 0) * 0.15))\`,
            transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.1s ease-out',
            opacity: 1
          }}
        >
          {/* Glass glare effect */}
          <div className="absolute inset-0 rounded-full mix-blend-overlay" style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)'
          }} />
        </div>
      )}
    </>
  )
}
