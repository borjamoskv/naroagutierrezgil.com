'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Home() {
  const heroBgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroBgRef.current) {
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;
        heroBgRef.current.style.transform = `translateX(${x}px) translateY(${y}px) scale(1.1)`;
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const artworks = [
    { title: 'DiviNos Amy', year: '2026', tech: 'Técnica Mixta con Hoja de Oro', img: '/assets/amy-new.webp' },
    { title: 'The Golden Couple', year: '2024', tech: 'Acrílico y Hoja de Oro', img: '/assets/james-new.webp' },
    { title: 'Pippilotta', year: '2024', tech: 'Técnica Mixta y Barniz', img: '/assets/audrey-hepburn-DbIBTtIp.webp' },
    { title: 'Rosetta', year: '2023', tech: 'Acrílico y Mica s/ Pizarra', img: '/assets/rosetta-new.webp' },
    { title: 'Espejo del Alma I', year: '2024', tech: 'Base de pizarra centenaria vasca', img: '/assets/601340023_1552126202933462_7815927344957967258_n.webp' },
    { title: 'Dama de la Pizarra', year: '2025', tech: 'Acrílico sobre relieve de pizarra', img: '/assets/608211438_1562089535270462_2827127275272133326_n.webp' },
  ];

  return (
    <main className="w-full flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="h-screen w-full relative flex items-center justify-center overflow-hidden">
        <img 
          ref={heroBgRef}
          src="/assets/amy-new.webp" 
          alt="NAROA Hero" 
          className="absolute top-0 left-0 w-full h-full object-cover opacity-[0.35] transition-transform duration-500 ease-out"
        />
        <div className="z-10 text-center mix-blend-overlay pointer-events-none">
          <h1 className="text-6xl md:text-8xl tracking-[0.4em] md:tracking-[0.6em] font-light uppercase opacity-90 pl-4 md:pl-8">NAROA</h1>
          <p className="text-xs md:text-sm tracking-[0.3em] md:tracking-[0.4em] mt-6 font-mono opacity-60">PERCEPCIÓN • TENSIÓN • GRAVEDAD</p>
          <p className="mt-12 text-[0.6rem] tracking-[0.3em] opacity-40">BILBAO, ESPAÑA</p>
        </div>
      </section>

      {/* Galería Inmersiva */}
      <section className="px-6 py-32 md:p-32 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 max-w-[1800px] w-full">
        {artworks.map((art, idx) => (
          <article key={idx} className="relative overflow-hidden aspect-[4/5] bg-[#0A0A0A] group border border-white/5">
            <img 
              src={art.img} 
              alt={art.title} 
              className="w-full h-full object-cover grayscale-[30%] opacity-80 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 bg-gradient-to-t from-black/95 via-black/60 to-transparent translate-y-12 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 pointer-events-none flex flex-col justify-end">
              <h3 className="text-2xl md:text-3xl font-light mb-2 tracking-widest uppercase">{art.title}</h3>
              <p className="text-xs text-[#888] font-mono tracking-widest uppercase">{art.year} | {art.tech}</p>
              
              <div className="mt-8 overflow-hidden pointer-events-auto">
                <Link href="/contacto" className="inline-block px-6 py-3 border border-white/20 text-[0.6rem] md:text-xs uppercase tracking-[0.2em] text-white/80 transition-all duration-500 hover:bg-white hover:text-black hover:border-white">
                  Inscripción & Detalles
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Footer Inmersivo */}
      <footer className="w-full text-center py-32 border-t border-white/5 bg-[#030303] flex flex-col items-center justify-center gap-4">
        <h4 className="text-xl md:text-2xl tracking-[0.5em] font-light opacity-80 uppercase">NAROA</h4>
        <p className="text-[0.6rem] text-[#555] tracking-[0.3em] font-mono uppercase">ESTUDIO & LABORATORIO</p>
        <p className="text-[0.5rem] text-[#333] tracking-[0.2em] mt-8 uppercase">&copy; 2026 NAROA GUTIÉRREZ GIL</p>
      </footer>
    </main>
  );
}
