"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface TakeoverModalProps {
  artwork: { src: string; title: string } | null;
  countdown: number;
  getImageUrl: (src: string) => string;
  onClose: () => void;
}

export default function TakeoverModal({ artwork, countdown, getImageUrl, onClose }: TakeoverModalProps) {
  const [zoomMode, setZoomMode] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!zoomMode || !containerRef.current || !imgRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    imgRef.current.style.transformOrigin = `${x * 100}% ${y * 100}%`;
  };

  if (!artwork) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col justify-center items-center overflow-hidden animate-[fadeIn_0.3s_ease-out] cursor-none"
    >
      {/* HUD Superior */}
      <div className="absolute top-8 w-full px-8 z-[1000] flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-white/50">Inspección Termodinámica</span>
          <h2 className="text-3xl font-serif text-white tracking-widest uppercase">{artwork.title}</h2>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="font-mono text-[9px] tracking-[0.3em] text-white/50 hover:text-white border border-white/10 hover:border-white/50 bg-black/40 backdrop-blur-md px-4 py-2 rounded-sm transition-all duration-300 pointer-events-auto cursor-pointer"
        >
          CERRAR // ESC
        </button>
      </div>

      {/* Amplified Artwork container */}
      <div 
        ref={containerRef}
        onClick={(e) => {
          e.stopPropagation();
          setZoomMode(!zoomMode);
        }}
        onPointerMove={handlePointerMove}
        className={`relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden cursor-crosshair z-10 
          ${zoomMode ? 'w-[100vw] h-[100vh] border-none' : 'w-[85vw] h-[75vh] border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.03)]'}`}
      >
        <Image
          ref={imgRef}
          src={getImageUrl(artwork.src)}
          alt={artwork.title}
          fill
          className={`object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] ${zoomMode ? 'scale-[2.5]' : 'scale-100'}`}
          sizes="100vw"
          quality={100}
          priority
        />
        
        {/* Toggle Zoom Hint */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm border border-white/10 text-white/50 font-sans text-[9px] tracking-[0.3em] uppercase transition-opacity duration-500 pointer-events-none ${zoomMode ? 'opacity-0' : 'opacity-100'}`}>
          Click para Zoom Extremo
        </div>
      </div>

      {/* HUD info overlays */}
      <div className="absolute bottom-8 left-8 right-8 z-[100] flex justify-between items-end pointer-events-none">
        <div className="flex flex-col gap-1 backdrop-blur-md bg-black/40 border border-white/10 px-4 py-3 rounded-sm">
          <span className="text-[9px] tracking-[0.5em] uppercase text-white/40 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" />
            ANÁLISIS DE PIZARRA
          </span>
          <span className="font-mono text-[10px] text-white/70 tracking-widest uppercase">
            Resolución: KINTSUGI-MAX // Textura: 94%
          </span>
        </div>
        
        <div className="flex flex-col items-end backdrop-blur-md bg-black/40 border border-white/10 px-4 py-3 rounded-sm">
          <span className="text-[9px] tracking-[0.3em] uppercase text-white/40 mb-1">AUTO-CIERRE</span>
          <div className="flex items-center gap-3">
            <span className="text-xl font-mono text-white/90 tracking-tighter">{countdown}.0s</span>
            <div className="w-12 h-[2px] bg-white/10 relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-white transition-all duration-[4000ms] ease-linear"
                style={{ width: `${(countdown / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}