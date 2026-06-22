"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

interface ParallaxHoverCardProps {
  src: string;
  title: string;
  subtitle: string;
  chapterNumber: string;
  details: string[];
  className?: string;
}

/**
 * ParallaxHoverCard component inspired by Dennis Snellenberg and Immersive Garden.
 * Applies a smooth 3D parallax tilt relative to mouse position when hovered.
 * 
 * Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
 */
export default function ParallaxHoverCard({
  src,
  title,
  subtitle,
  chapterNumber,
  details,
  className = "",
}: ParallaxHoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card center (normalized between -0.5 and 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Calculate maximum degrees of tilt (e.g., max 10 degrees)
    const maxTilt = 8;
    setTilt({
      x: -mouseY * maxTilt,
      y: mouseX * maxTilt,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden bg-[#0F0F0F] border border-white/5 rounded-sm shadow-2xl transition-all duration-500 hover:border-primary/30 flex flex-col justify-between ${className}`}
      style={{
        perspective: "1000px",
      }}
    >
      {/* 3D Tilting Image Wrapper */}
      <div
        className="relative w-full aspect-[4/5] overflow-hidden"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.03 : 1.0})`,
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        <Image
          src={src}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
      </div>

      {/* Content overlay */}
      <div className="p-6 sm:p-8 relative z-20 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-[9px] tracking-[0.3em] text-primary uppercase">
              {chapterNumber}
            </span>
            <span className="font-mono text-[8px] tracking-[0.2em] text-white/30 uppercase">
              C5-REAL // SYS_ID: borjamoskv
            </span>
          </div>

          <h3 className="font-serif text-2xl uppercase tracking-wider text-white mb-2 group-hover:text-primary transition-colors duration-500">
            {title}
          </h3>
          <p className="font-sans text-xs tracking-wider text-white/50 mb-6 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Diagnostic/Kintsugi Details appearing on hover */}
        <div className={`space-y-2 border-t border-white/5 pt-4 transition-all duration-700 ${isHovered ? "opacity-100 max-h-40" : "opacity-30 max-h-16 overflow-hidden"}`}>
          {details.map((detail, idx) => (
            <div key={idx} className="flex justify-between items-center text-[9px] font-mono tracking-wider">
              <span className="text-white/30">{detail.split(":")[0]}:</span>
              <span className="text-white/70 text-right">{detail.split(":")[1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Frame decoration borders drawing on hover */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
      <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-right" />
      <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top" />
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-bottom" />
    </div>
  );
}
