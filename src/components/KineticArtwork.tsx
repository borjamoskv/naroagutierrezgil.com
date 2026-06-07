"use client";

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
  return (
    <div 
      id={id} 
      className={`w-full h-full cursor-pointer overflow-hidden ${className || ''}`}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 80vw"
        quality={100}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
