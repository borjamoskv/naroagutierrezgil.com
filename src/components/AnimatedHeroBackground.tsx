'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const heroImages = [
  { src: '/assets/el-gran-dakari-C1tAWAhR.webp', alt: 'El Gran Dakari (Indio)' },
  { src: '/assets/geisha-MfRtKWdu.webp', alt: 'Geisha' },
  { src: '/assets/hq-james-CjsTrO7r.webp', alt: 'Pop Icon' }
];

export default function AnimatedHeroBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-20 mix-blend-overlay" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20 mix-blend-overlay opacity-50" />
      
      {heroImages.map((img, idx) => (
        <div
          key={img.src}
          className={`absolute inset-0 transition-all duration-[6000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
            idx === currentIndex 
              ? 'opacity-40 scale-110 blur-0' 
              : 'opacity-0 scale-100 blur-sm'
          }`}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover mix-blend-screen grayscale contrast-[1.3] brightness-75"
            priority={idx === 0}
            sizes="100vw"
            quality={90}
          />
        </div>
      ))}
      
      {/* Extreme Vignette & Deep Shadows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_80%,#000000_100%)] opacity-100 z-10" />
      
      {/* Color Dodge Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb,43,59,229),0.15)_0%,transparent_60%)] mix-blend-color-dodge z-10" />
    </div>
  );
}
