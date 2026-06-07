"use client";

import { useEffect, useRef, useState } from "react";

export default function Soundscape() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleFirstInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
  }, []);

  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;
    
    let rafId: number;
    const updateAudio = () => {
      const scrollVel = parseFloat(document.documentElement.style.getPropertyValue('--scroll-velocity')) || 0;
      
      if (audioRef.current) {
        // MODO CAOS Audio Reactive:
        // A mayor velocidad de scroll, mayor fricción (pitch y volumen)
        const targetRate = 1.0 + Math.min(scrollVel / 50, 1.5);
        audioRef.current.playbackRate += (targetRate - audioRef.current.playbackRate) * 0.1;
        
        const targetVol = 0.5 + Math.min(scrollVel / 100, 0.5);
        audioRef.current.volume += (targetVol - audioRef.current.volume) * 0.1;
      }
      
      rafId = requestAnimationFrame(updateAudio);
    };
    rafId = requestAnimationFrame(updateAudio);
    
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  const toggleSound = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Intenta reproducir. Los navegadores pueden bloquear auto-play incluso así, 
      // pero como está bajo interacción explícita (onClick), no fallará.
      audioRef.current.play().catch(e => console.error("Audio context blocked:", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <audio 
        ref={audioRef}
        loop
        // URL de contingencia/placeholder apuntando a tu servidor o a un track ambiental
        src="https://naroa.online/assets/ambient.mp3" 
      />
      
      <button
        onClick={toggleSound}
        className={`fixed bottom-6 left-6 z-[200] flex items-center gap-3 cursor-pointer group transition-opacity duration-1000 mix-blend-difference ${hasInteracted ? 'opacity-80 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="Toggle Soundscape"
      >
        {/* Equalizer icon */}
        <div className="flex items-end h-3 gap-[2px]">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className={`w-[2px] bg-[#2B3BE5] transition-all duration-300 ${isPlaying ? 'h-full' : 'h-[3px]'}`}
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#EAEAEA] group-hover:text-[#2B3BE5] transition-colors">
          {isPlaying ? 'AUDIO: ON' : 'AUDIO: OFF'}
        </span>
      </button>
    </>
  );
}
