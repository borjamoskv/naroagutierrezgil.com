"use client";

import { useEffect } from 'react';
import Image from 'next/image';

interface TakeoverModalProps {
  artwork: { src: string; title: string; category?: string; desc?: string } | null;
  countdown?: number | null;
  isPersistent?: boolean;
  getImageUrl: (src: string) => string;
  onClose: () => void;
}

export default function TakeoverModal({ artwork, countdown, isPersistent = false, getImageUrl, onClose }: TakeoverModalProps) {
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

  const showCountdown = !isPersistent && countdown !== undefined && countdown !== null;

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
        className="absolute top-8 right-8 z-[1000] font-mono text-[10px] tracking-[0.4em] text-white/40 hover:text-[#2B3BE5] border border-white/5 hover:border-[#2B3BE5]/50 bg-black/60 backdrop-blur-xl px-6 py-3 transition-all duration-500 hover:shadow-[0_0_20px_rgba(43,59,229,0.4)] pointer-events-auto group cursor-pointer"
      >
        <span className="relative z-10 flex items-center gap-3">
          <span className="w-1 h-1 bg-white/40 group-hover:bg-[#2B3BE5] transition-colors rounded-full" />
          CERRAR VISTA [ESC]
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

      {/* Massive Outlined Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif italic text-[22vw] leading-none font-black text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.02)] uppercase pointer-events-none select-none z-0 mix-blend-difference opacity-50">
        NAROART
      </div>

      {/* Amplified Artwork container with brutalist border */}
      <div 
        onClick={(e) => e.stopPropagation()}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const rotX = ((y / rect.height) - 0.5) * -10;
          const rotY = ((x / rect.width) - 0.5) * 10;
          e.currentTarget.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
          e.currentTarget.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
          e.currentTarget.style.setProperty('--rotate-x', `${rotX}deg`);
          e.currentTarget.style.setProperty('--rotate-y', `${rotY}deg`);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.setProperty('--rotate-x', `0deg`);
          e.currentTarget.style.setProperty('--rotate-y', `0deg`);
          e.currentTarget.style.setProperty('--mouse-x', `50%`);
          e.currentTarget.style.setProperty('--mouse-y', `50%`);
        }}
        className="relative w-[95vw] h-[70vh] md:w-[75vw] md:h-[75vh] border border-[#2B3BE5]/30 bg-[#050505] shadow-[0_0_150px_rgba(43,59,229,0.15)] z-10 overflow-hidden group perspective-[1000px]"
      >
        <div className="absolute inset-0 transition-transform duration-200 ease-out preserve-3d" style={{ transform: 'rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) scale(1.02)' }}>
          <Image
            src={getImageUrl(artwork.src)}
            alt={artwork.title}
            fill
            className="object-contain contrast-[1.05] brightness-[0.95] saturate-[0.95] transition-all duration-[5000ms] scale-[1.01] group-hover:scale-105 ease-[cubic-bezier(0.2,0.8,0.2,1)] drop-shadow-[0_0_100px_rgba(255,255,255,0.05)]"
            style={{ filter: 'url(#art-wink)' }}
            sizes="(max-width: 768px) 100vw, 80vw"
            quality={100}
            priority
          />
          {/* Interactive Glare / Wink Effect */}
          <div 
            className="absolute inset-0 mix-blend-overlay pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{
              background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.3) 0%, transparent 40%)'
            }}
          />
          {/* Subtle automated Wink sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[rgba(255,255,255,0.1)] to-transparent -translate-x-full animate-[shimmerWink_3s_infinite] mix-blend-overlay pointer-events-none" />
        </div>

      {/* SVG Wink Filter definition */}
      <svg className="hidden">
        <filter id="art-wink">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" in="noise" result="coloredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="coloredNoise" xChannelSelector="R" yChannelSelector="G" scale="0">
            <animate attributeName="scale" values="0; 15; 0; 0" keyTimes="0; 0.02; 0.04; 1" dur="7s" repeatCount="indefinite" />
          </feDisplacementMap>
        </filter>
      </svg>
        
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
            <span className="w-1.5 h-1.5 bg-[#2B3BE5] rounded-full" />
            <span className="text-[9px] tracking-[0.6em] uppercase text-[#2B3BE5] font-bold">
              ARTWORK PREVIEW
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black uppercase tracking-tighter text-white/90">
            {artwork.title}
          </h2>
          {artwork.desc && (
            <>
              <div className="w-full h-px bg-gradient-to-r from-[#2B3BE5]/50 to-transparent mt-3 mb-2" />
              <p className="text-[10px] font-sans text-white/60 tracking-wider leading-relaxed">
                {artwork.desc}
              </p>
            </>
          )}
        </div>

        {showCountdown ? (
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
                style={{ height: `${((countdown || 0) / 4) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 md:mt-0 flex flex-col items-end backdrop-blur-2xl bg-black/50 border border-white/5 p-6 md:p-8">
            {artwork.category && (
              <>
                <span className="text-[8px] tracking-[0.4em] uppercase text-white/30 mb-1">CATEGORÍA / MEDIO</span>
                <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">{artwork.category}</span>
                <div className="w-20 h-px bg-white/10 my-3" />
              </>
            )}
            <span className="text-[8px] tracking-[0.3em] uppercase text-[#2B3BE5] font-bold">
              [ CLIC EN CUALQUIER ZONA PARA CERRAR ]
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
