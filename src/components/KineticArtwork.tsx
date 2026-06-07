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
      className={`relative w-full h-full cursor-pointer overflow-hidden ${className || ''}`}
      id={id}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 80vw"
        quality={100}
        priority={priority}
        className={`object-cover transition-all duration-1000 ease-out ${
          hovered ? 'scale-110 saturate-[1.2] brightness-110' : 'scale-100 saturate-100 brightness-100'
        }`}
      />
      {hovered && (
        <div className="absolute inset-0 bg-primary/10 mix-blend-color-dodge transition-opacity duration-500 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
