'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';

export default function WordPressPortal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible) {
        const scrolled = (window.innerHeight - rect.top) / window.innerHeight;
        containerRef.current.style.setProperty('--scroll', Math.min(Math.max(scrolled, 0), 1).toString());
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-[70vh] py-32 overflow-hidden bg-[#050505] flex items-center justify-center border-t border-white/5"
    >
      {/* Dynamic Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: 'translateY(calc(var(--scroll, 0) * 100px))'
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col items-center">
        {/* Title */}
        <div className="flex flex-col items-center text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--primary)]/10 blur-[100px] rounded-full pointer-events-none" />
          <h2 className="font-sans text-5xl md:text-7xl font-bold tracking-tighter uppercase text-white mix-blend-difference z-10">
            Crónica <span className="text-[var(--primary)] font-light italic">Alquímica</span>
          </h2>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50 mt-6 max-w-xl">
            Diario de exploraciones lóticas, bitácora del polvo de mica y reflexiones sobre hiperrealismo visceral.
          </p>
        </div>

        {/* Portal Card */}
        <div className="relative group w-full max-w-4xl cursor-pointer">
          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-white/10 rounded-sm blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          
          <a 
            href="https://naroagutierrez.wordpress.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative flex flex-col md:flex-row items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-sm overflow-hidden transition-all duration-500 hover:border-[var(--primary)]"
          >
            {/* Visual Glitch Frame */}
            <div className="w-full md:w-2/5 h-64 md:h-auto min-h-[300px] relative overflow-hidden bg-[#111]">
              <div className="absolute inset-0 opacity-50 bg-[url('/assets/amy-new.webp')] bg-cover bg-center mix-blend-luminosity filter grayscale group-hover:grayscale-0 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#050505] to-transparent" />
              
              <div className="absolute bottom-6 left-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                <span className="font-mono text-[9px] tracking-widest text-[var(--primary)] uppercase">Transmisión Activa</span>
              </div>
            </div>

            {/* Content Text */}
            <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase mb-4">WordPress // Blog Oficial</span>
              <h3 className="font-sans text-3xl md:text-4xl font-bold text-white mb-6 uppercase tracking-tight">
                Naroa Gutiérrez Gil
              </h3>
              <p className="font-sans text-sm text-white/60 leading-relaxed mb-8">
                Accede al archivo documental. Reflexiones, exposiciones, y el proceso bruto detrás de la transformación de la pizarra, el oro y el poliéster en arte matérico.
              </p>
              
              <div className="flex items-center text-[var(--primary)] font-mono text-[11px] tracking-widest uppercase group-hover:gap-4 gap-2 transition-all duration-300">
                <span>Acceder al Portal</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:translate-x-1 transition-transform">
                  <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
