"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface TakeoverModalProps {
  artwork: { src: string; title: string } | null;
  countdown: number;
  getImageUrl: (src: string) => string;
  onClose: () => void;
}

export default function TakeoverModal({ artwork, countdown, getImageUrl, onClose }: TakeoverModalProps) {
  const [randomId, setRandomId] = useState<string>('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRandomId(Math.random().toString(36).substring(2, 10).toUpperCase());
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!artwork) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-[#030303] flex flex-col justify-center items-center overflow-hidden animate-[fadeIn_0.5s_ease-out]"
    >
      {/* Close Button in top right */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar modal"
        className="absolute top-8 right-8 z-[1000] font-mono text-[10px] tracking-[0.4em] text-white/40 hover:text-[#2B3BE5] border border-white/5 hover:border-[#2B3BE5]/50 bg-black/60 backdrop-blur-xl px-6 py-3 transition-all duration-500 hover:shadow-[0_0_20px_rgba(43,59,229,0.4)] pointer-events-auto group"
      >
        <span className="relative z-10 flex items-center gap-3">
          <span className="w-1 h-1 bg-white/40 group-hover:bg-[#2B3BE5] transition-colors rounded-full" />
          ABORT SEQUENCE [ESC]
        </span>
      </button>

      {/* Deep scanlines & Noise */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none z-50 mix-blend-overlay opacity-80" />
      
      {/* Deep Chromatic background aura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(43,59,229,0.15)_0%,transparent_80%)] mix-blend-color-dodge pointer-events-none" />

      {/* Massive Outlined CRONOS Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif italic text-[25vw] leading-none font-black text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.03)] uppercase pointer-events-none select-none z-0 mix-blend-difference opacity-50">
        CRONOS
      </div>

      {/* Amplified Artwork container with brutalist glitch border */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-[95vw] h-[75vh] md:w-[75vw] md:h-[80vh] border border-[#2B3BE5]/30 bg-[#050505] shadow-[0_0_150px_rgba(43,59,229,0.15)] z-10 overflow-hidden group"
      >
        <Image
          src={getImageUrl(artwork.src)}
          alt={artwork.title}
          fill
          className="object-cover contrast-[1.15] brightness-[0.8] saturate-[0.1] transition-all duration-[5000ms] scale-[1.05] group-hover:scale-110 group-hover:saturate-100 group-hover:brightness-100 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          sizes="(max-width: 768px) 100vw, 80vw"
          quality={100}
          priority
        />
        {/* Dynamic Glitch Overlay */}
        <div className="absolute inset-0 bg-[#2B3BE5] mix-blend-color opacity-30 group-hover:opacity-0 transition-opacity duration-1000" />
        
        {/* Frame reticles */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/30" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/30" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/30" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/30" />
      </div>

      {/* HUD info overlays */}
      <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12 z-[100] flex flex-col md:flex-row md:items-end justify-between pointer-events-none">
        
        <div className="flex flex-col gap-2 backdrop-blur-2xl bg-black/50 border border-white/5 p-6 md:p-8 max-w-xl">
          <div className="flex items-center gap-4 mb-2">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
            <span className="text-[10px] tracking-[0.6em] uppercase text-[#2B3BE5] font-bold">
              SYSTEM OVERRIDE
            </span>
          </div>
          <h2 className="text-4xl sm:text-7xl font-serif font-black uppercase tracking-tighter text-white/90 chromatic-text">
            {artwork.title}
          </h2>
          <div className="w-full h-px bg-gradient-to-r from-[#2B3BE5]/50 to-transparent mt-4 mb-2" />
          <span className="text-xs font-mono text-white/30 tracking-widest uppercase">ID: {randomId}</span>
        </div>

        <div className="mt-4 md:mt-0 flex flex-row items-end gap-6 backdrop-blur-2xl bg-black/50 border border-white/5 p-6 md:p-8">
          <div className="flex flex-col items-end justify-end h-full">
            <span className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-2">TERMINATION IN</span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-mono font-black text-white/90 tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{countdown}</span>
              <span className="text-xl text-[#2B3BE5] font-mono font-bold tracking-widest">.00</span>
            </div>
          </div>
          <div className="w-[3px] h-20 bg-white/5 relative overflow-hidden">
            <div 
              className="absolute bottom-0 left-0 w-full bg-[#2B3BE5] transition-all duration-[4000ms] ease-linear shadow-[0_0_20px_rgba(43,59,229,1)]"
              style={{ height: `${(countdown / 4) * 100}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
