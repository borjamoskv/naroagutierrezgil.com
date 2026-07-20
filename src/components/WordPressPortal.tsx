'use client';

import { useRef, useEffect, useState } from 'react';

export default function WordPressPortal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-[80vh] py-32 overflow-hidden bg-[#020202] flex items-center justify-center border-y border-white/10"
    >
      {/* Brutalist Infinite Marquee Background */}
      <div className="absolute top-1/4 left-0 w-[200vw] -translate-y-1/2 -rotate-3 opacity-[0.03] mix-blend-screen pointer-events-none flex whitespace-nowrap z-0">
        <span className="text-[15vw] font-black font-sans uppercase tracking-tighter leading-none text-white animate-[slideLeft_60s_linear_infinite]">
          WORDPRESS // BLOG // ALQUIMIA // WORDPRESS // BLOG // ALQUIMIA // WORDPRESS // BLOG // ALQUIMIA //
        </span>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(43,59,229,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Kinetic Scanlines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-10 mix-blend-overlay opacity-30" />

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col items-center">
        {/* Title Block */}
        <div className="flex flex-col items-center text-center mb-20 relative">
          <div className="inline-flex items-center gap-4 mb-6 border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-2 rounded-none">
            <span className="w-2 h-2 bg-[var(--primary)] animate-pulse shadow-[0_0_10px_var(--primary)]" />
            <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-[var(--primary)]">Transmisión Lótica C5-REAL</span>
          </div>
          <h2 className="font-sans text-5xl md:text-8xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            Crónica <span className="text-[var(--primary)] italic font-light mix-blend-lighten">Alquímica</span>
          </h2>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 mt-8 max-w-2xl border-l border-[var(--primary)] pl-6 text-left">
            Bitácora de hiperrealismo visceral. El proceso destructivo y generativo documentado sin compresión.
          </p>
        </div>

        {/* 3D Kinetic Portal Card */}
        <div className="relative group w-full max-w-5xl [perspective:1000px] z-30">
          {/* Neon Glow behind card */}
          <div 
            className="absolute -inset-2 bg-[var(--primary)] rounded-none blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700" 
            style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
          />
          
          <a 
            ref={cardRef}
            href="https://naroagutierrez.wordpress.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative flex flex-col md:flex-row items-stretch bg-black/40 backdrop-blur-3xl border border-white/10 overflow-hidden transition-all duration-300 ease-out"
            style={{
              transform: `rotateY(${mousePos.x * 10}deg) rotateX(${-mousePos.y * 10}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Visual Glitch Frame (Left Side) */}
            <div className="w-full md:w-1/2 h-72 md:h-auto min-h-[400px] relative overflow-hidden bg-[#000000]">
              <div 
                className="absolute inset-[-10%] bg-[url('/assets/amy-new.webp')] bg-cover bg-center mix-blend-luminosity filter grayscale group-hover:grayscale-0 transition-all duration-1000" 
                style={{ transform: `scale(1.1) translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/50 to-transparent" />
              
              <div className="absolute top-6 left-6 flex flex-col gap-1">
                <span className="font-mono text-[8px] tracking-[0.5em] text-white/50 uppercase">WP.COM // 2026</span>
                <span className="font-mono text-[8px] tracking-[0.5em] text-[var(--primary)] uppercase">NAROAGUTIERREZ.WORDPRESS.COM</span>
              </div>
            </div>

            {/* Content Text (Right Side) */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center border-l border-white/5 bg-black/60 relative overflow-hidden group-hover:bg-black/40 transition-colors duration-500">
              {/* Internal noise */}
              <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

              <div className="relative z-10" style={{ transform: 'translateZ(30px)' }}>
                <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--primary)] uppercase mb-6 block border-b border-[var(--primary)]/30 pb-4 inline-block">
                  Bitácora Oficial
                </span>
                <h3 className="font-sans text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter leading-[0.9]">
                  Archivo<br />Documental
                </h3>
                <p className="font-sans text-xs sm:text-sm text-white/50 leading-relaxed mb-10">
                  Bitácora del proceso material detrás de la transformación de la pizarra y el oro en hiperrealismo visceral.
                </p>
                
                <div className="inline-flex items-center gap-4 border border-white/20 px-8 py-4 bg-white/5 hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-all duration-300 text-white font-mono text-[10px] tracking-[0.3em] uppercase group/btn">
                  <span>Acceder al Portal</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover/btn:translate-x-2 transition-transform">
                    <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
