'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const heroImages = [
  { src: 'https://naroa.online/assets/el-gran-dakari-C1tAWAhR.webp', alt: 'El Gran Dakari (Indio)' },
  { src: 'https://naroa.online/assets/geisha-MfRtKWdu.webp', alt: 'Geisha' },
  { src: 'https://naroa.online/assets/hq-james-CjsTrO7r.webp', alt: 'Pop Icon' }
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
      {heroImages.map((img, idx) => (
        <div
          key={img.src}
          className={`absolute inset-0 transition-all duration-[4000ms] ease-in-out ${
            idx === currentIndex ? 'opacity-30 scale-105' : 'opacity-0 scale-100'
          }`}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover mix-blend-screen grayscale contrast-125"
            priority={idx === 0}
            sizes="100vw"
            quality={90}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0A0A_100%)] opacity-90" />
      <div className="absolute inset-0 bg-[#0A0A0A]/40" />
    </div>
  );
}
