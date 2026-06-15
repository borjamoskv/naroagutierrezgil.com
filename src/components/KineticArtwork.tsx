'use client';

import { useState } from 'react';
import Image from 'next/image';

interface KineticArtworkProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  id?: string;
  onClick?: () => void;
}

export default function KineticArtwork({ src, alt, priority, className, id, onClick }: KineticArtworkProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className={`relative w-full h-full cursor-pointer overflow-hidden group/kinetic ${className || ''}`}
      id={id}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Purged artificial color overlays to protect hyperrealism */}
      <div className="absolute inset-0 ring-1 ring-white/5 group-hover/kinetic:ring-white/20 transition-all duration-700 z-30 pointer-events-none" />
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
      {/* External noise grain purged. The slate texture handles its own grain. */}
    </div>
  );
}
