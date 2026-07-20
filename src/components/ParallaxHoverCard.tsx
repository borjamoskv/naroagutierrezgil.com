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
 * Text details are fully hidden by default and slide up on hover, keeping the art at the center.
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

    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    const maxTilt = 3;
    setTilt({
      x: -mouseY * maxTilt,
      y: mouseX * maxTilt,
    });

    const mouseXPercent = ((e.clientX - rect.left) / width) * 100;
    const mouseYPercent = ((e.clientY - rect.top) / height) * 100;
    card.style.setProperty('--mouse-x', `${mouseXPercent}%`);
    card.style.setProperty('--mouse-y', `${mouseYPercent}%`);
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
      className={`group relative overflow-hidden bg-[#000000] border border-white/5 rounded-sm shadow-2xl transition-all duration-500 hover:border-primary/30 aspect-[4/5] cursor-pointer ${className}`}
      style={{
        perspective: "1000px",
      }}
    >
      {/* 3D Tilting Image Wrapper (occupies 100% of container) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1.0})`,
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
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
        {/* Radial spotlight shine effect tracking mouse */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
          style={{
            background: `radial-gradient(circle 200px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.25), transparent 80%)`
          }}
        />
        {/* Dark vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-95" />
      </div>

      {/* Title & Chapter Display (Static Overlay) */}
      <div className="absolute bottom-0 inset-x-0 p-8 z-20 flex flex-col justify-end pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-24">
        <span className="font-mono text-[9px] tracking-[0.4em] text-primary uppercase mb-2 font-bold">
          {chapterNumber}
        </span>
        <h3 className="font-serif text-3xl uppercase tracking-wider text-white mb-1 drop-shadow-md">
          {title}
        </h3>
        <p className="font-sans text-xs tracking-wider text-white/50 leading-relaxed max-w-xs transition-opacity duration-500 opacity-100 group-hover:opacity-0">
          {subtitle}
        </p>
      </div>

      {/* specs detail drawer sliding up on hover */}
      <div className="absolute inset-x-0 bottom-0 p-8 z-30 transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] bg-black/85 backdrop-blur-md border-t border-white/10 flex flex-col gap-4 pointer-events-none">
        <span className="font-mono text-[8px] tracking-[0.3em] text-[#2B3BE5] uppercase font-bold">
          ESPECIFICACIONES DEL SOPORTE
        </span>
        <div className="space-y-2">
          {details.map((detail, idx) => (
            <div key={idx} className="flex justify-between items-center text-[9px] font-mono tracking-wider">
              <span className="text-white/30">{detail.split(":")[0]}:</span>
              <span className="text-white/70 text-right">{detail.split(":")[1]}</span>
            </div>
          ))}
        </div>
        <div className="text-[8px] font-mono text-white/20 tracking-widest text-right mt-2">
          C5-REAL // LATENT
        </div>
      </div>

      {/* Frame decoration borders drawing on hover */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left z-40" />
      <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-right z-40" />
      <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top z-40" />
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-bottom z-40" />
    </div>
  );
}
