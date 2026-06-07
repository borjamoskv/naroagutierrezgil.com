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
      <div className="absolute inset-0 bg-primary/20 mix-blend-color-dodge opacity-0 group-hover/kinetic:opacity-100 transition-opacity duration-700 z-20 pointer-events-none" />
      <div className="absolute inset-0 ring-1 ring-white/5 group-hover/kinetic:ring-primary/50 transition-all duration-700 z-30 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" />
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 80vw"
        quality={100}
        priority={priority}
        className={`object-cover transition-all duration-[2000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          hovered ? 'scale-110 rotate-1 saturate-[1.3] brightness-110 contrast-125' : 'scale-100 rotate-0 saturate-100 brightness-95 contrast-100'
        }`}
      />
      {hovered && (
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-10 pointer-events-none" />
      )}
    </div>
  );
}
