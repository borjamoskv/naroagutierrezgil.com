'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import InteractiveArtworkCanvas from './InteractiveArtworkCanvas';

interface GalleryArtworkProps {
  title: string;
  year: string;
  tech: string;
  img: string;
}

export default function GalleryArtwork({ title, year, tech, img }: GalleryArtworkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; // Invert Y for WebGL
    setMousePos({ x, y });
  };

  return (
    <article 
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0.5, y: 0.5 }); }}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden aspect-[4/5] bg-[#0A0A0A] group border border-white/5 cursor-crosshair"
    >
      <div className="absolute inset-0 z-0">
        <InteractiveArtworkCanvas 
          url={img} 
          isHovered={isHovered} 
          mouseX={mousePos.x} 
          mouseY={mousePos.y} 
        />
      </div>
      
      <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 bg-gradient-to-t from-black/95 via-black/60 to-transparent translate-y-12 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 pointer-events-none flex flex-col justify-end z-20">
        <h3 className="text-2xl md:text-3xl font-light mb-2 tracking-widest uppercase">{title}</h3>
        <p className="text-xs text-[#888] font-mono tracking-widest uppercase">{year} | {tech}</p>
        
        <div className="mt-8 overflow-hidden pointer-events-auto">
          <Link href="/contacto" className="inline-block px-6 py-3 border border-white/20 text-[0.6rem] md:text-xs uppercase tracking-[0.2em] text-white/80 transition-all duration-500 hover:bg-white hover:text-black hover:border-white">
            Inscripción & Detalles
          </Link>
        </div>
      </div>
    </article>
  );
}
