'use client';

import { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const InteractiveArtworkCanvas = dynamic(() => import('./InteractiveArtworkCanvas'), { ssr: false });

interface KineticArtworkProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  id?: string;
  onClick?: () => void;
}

// Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
export default function KineticArtwork({ src, alt, priority, className, id, onClick }: KineticArtworkProps) {
  const [hovered, setHovered] = useState(false);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; // Inverted for WebGL Y coordinates
    setMouse({ x, y });
  };

  return (
    <div 
      className={`relative w-full h-full cursor-pointer overflow-hidden group/kinetic ${className || ''}`}
      id={id}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Purged artificial color overlays to protect hyperrealism */}
      <div className="absolute inset-0 ring-1 ring-white/5 group-hover/kinetic:ring-white/20 transition-all duration-700 z-30 pointer-events-none" />
      
      {/* Static background image to prevent flashes during WebGL context init */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 80vw"
        quality={100}
        priority={priority}
        className={`object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-transform ${
          hovered ? 'scale-[1.03]' : 'scale-100'
        }`}
      />

      {/* WebGL interactive displacement overlay loaded JIT on hover */}
      {hovered && (
        <InteractiveArtworkCanvas 
          url={src} 
          isHovered={hovered} 
          mouseX={mouse.x} 
          mouseY={mouse.y} 
        />
      )}
    </div>
  );
}
