'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface MaterialInspectorProps {
  imageSrc: string;
  alt: string;
  zoomLevel?: number;
}

export const MaterialInspector: React.FC<MaterialInspectorProps> = ({
  imageSrc,
  alt,
  zoomLevel = 3.5,
}) => {
  const [showLoupe, setShowLoupe] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Constrain lens within image box
    if (x < 0 || y < 0 || x > width || y > height) {
      setShowLoupe(false);
      return;
    }

    setShowLoupe(true);
    setLensPosition({ x, y });

    // Calculate relative background offset in percentage
    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;
    setBgPosition({ x: bgX, y: bgY });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowLoupe(true)}
      onMouseLeave={() => setShowLoupe(false)}
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-[4/5] bg-[#050505] border border-white/10 overflow-hidden cursor-none shadow-2xl select-none group"
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority
      />

      {/* Dynamic Loupe Magnifying Lens */}
      {showLoupe && (
        <div
          className="absolute w-44 h-44 rounded-full border-2 border-[#F59E0B] shadow-[0_0_25px_rgba(245,158,11,0.5)] pointer-events-none z-30 overflow-hidden bg-[#0A0A0C]"
          style={{
            top: `${lensPosition.y - 88}px`,
            left: `${lensPosition.x - 88}px`,
            backgroundImage: `url(${imageSrc})`,
            backgroundPosition: `${bgPosition.x}% ${bgPosition.y}%`,
            backgroundSize: `${zoomLevel * 100}%`,
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Micro Crosshair Grid */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-full h-[1px] bg-[#F59E0B]" />
            <div className="h-full w-[1px] bg-[#F59E0B] absolute" />
          </div>
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-mono text-[#F59E0B]">
            4.0x SLATE INSPECTOR
          </div>
        </div>
      )}

      {/* Lens Prompt Hint */}
      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 text-[10px] font-mono text-neutral-300 pointer-events-none">
        🔍 Pasa el cursor para inspección mineral 4K
      </div>
    </div>
  );
};

export default MaterialInspector;
