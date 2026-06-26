'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function EspejoOscuro() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Custom cursor (Efecto Mica)
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
      
      // Parallax in Hero
      if (heroBgRef.current) {
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;
        heroBgRef.current.style.transform = `translateX(${x}px) translateY(${y}px) scale(1.1)`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const artworks = [
    { title: 'DiviNos Amy', year: '2026', tech: 'Técnica Mixta con Hoja de Oro', img: '/assets/amy-new.webp' },
    { title: 'Rosetta', year: '2023', tech: 'Acrílico y Mica s/ Pizarra', img: '/assets/rosetta-new.webp' }, // Asumiendo que existirá o usará fallback
    { title: 'The Golden Couple', year: '2024', tech: 'Acrílico y Hoja de Oro', img: '/assets/james-new.webp' }, // Reutilizando asset
    { title: 'Pippilotta', year: '2024', tech: 'Técnica Mixta y Barniz', img: '/assets/audrey-hepburn-DbIBTtIp.webp' } // Reutilizando asset
  ];

  return (
    <div className="bg-[#050505] text-[#e0e0e0] font-sans overflow-x-hidden min-h-screen cursor-none">
      
      {/* Cursor Personalizado */}
      <div 
        ref={cursorRef} 
        className="w-[20px] h-[20px] border border-white/50 rounded-full fixed pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100 ease-out -translate-x-1/2 -translate-y-1/2"
      />

      {/* Navegación Minimalista */}
      <nav className="fixed top-8 right-12 z-[100] flex gap-8">
        {['Obras', 'Estudio', 'Contacto'].map((item) => (
          <Link 
            key={item} 
            href="/"
            className="text-white text-xs uppercase tracking-widest relative py-1 group"
          >
            {item}
            <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full" />
          </Link>
        ))}
      </nav>

      {/* Hero Section */}
      <section className="h-screen w-full relative flex items-center justify-center overflow-hidden">
        <img 
          ref={heroBgRef}
          src="/assets/amy-new.webp" 
          alt="NAROA Hero" 
          className="absolute top-0 left-0 w-full h-full object-cover opacity-60 transition-transform duration-500 ease-out"
        />
        <div className="z-10 text-center mix-blend-overlay">
          <h1 className="text-5xl md:text-7xl tracking-[0.5em] font-light uppercase opacity-90">NAROA</h1>
          <p className="text-sm tracking-[0.2em] mt-4 font-mono opacity-70">PERCEPCIÓN • TENSION • GRAVEDAD</p>
          <p className="mt-8 text-[0.6rem] tracking-widest opacity-50">BILBAO, 2026</p>
        </div>
      </section>

      {/* Galería Inmersiva */}
      <section className="px-8 py-24 md:p-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-16 max-w-[1600px] mx-auto">
        {artworks.map((art, idx) => (
          <article key={idx} className="relative overflow-hidden aspect-[4/5] bg-[#111] group cursor-none">
            <img 
              src={art.img} 
              alt={art.title} 
              className="w-full h-full object-cover grayscale-[20%] transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent translate-y-8 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 pointer-events-none">
              <h3 className="text-xl font-light mb-2 tracking-wide">{art.title}</h3>
              <p className="text-xs text-[#aaa] font-mono tracking-wider">{art.year} | {art.tech}</p>
              <button className="mt-6 px-6 py-2 border border-white/30 text-[0.6rem] uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-black pointer-events-auto">
                Ver Detalles
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Footer Minimalista */}
      <footer className="text-center py-24 text-[0.6rem] text-[#555] tracking-[0.2em] uppercase">
        <p>NAROA GUTIÉRREZ GIL &copy; 2026</p>
        <p className="mt-2">BILBAO, SPAIN</p>
      </footer>
    </div>
  );
}
