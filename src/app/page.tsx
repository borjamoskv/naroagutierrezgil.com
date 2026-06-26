'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import HeroInteractiveCanvas from '@/components/HeroInteractiveCanvas';
import GalleryArtwork from '@/components/GalleryArtwork';

export default function Home() {
  const artworks = [
    { title: 'DiviNos Amy', year: '2026', tech: 'Técnica Mixta con Hoja de Oro', img: '/assets/amy-new.webp' },
    { title: 'The Golden Couple', year: '2024', tech: 'Acrílico y Hoja de Oro', img: '/assets/james-new.webp' },
    { title: 'Pippilotta', year: '2024', tech: 'Técnica Mixta y Barniz', img: '/assets/audrey-hepburn-DbIBTtIp.webp' },
    { title: 'Rosetta', year: '2023', tech: 'Acrílico y Mica s/ Pizarra', img: '/assets/rosetta-new.webp' },
    { title: 'Espejo del Alma I', year: '2024', tech: 'Base de pizarra centenaria vasca', img: '/assets/601340023_1552126202933462_7815927344957967258_n.webp' },
    { title: 'Dama de la Pizarra', year: '2025', tech: 'Acrílico sobre relieve de pizarra', img: '/assets/608211438_1562089535270462_2827127275272133326_n.webp' },
  ];

  return (
    <main className="w-full flex flex-col items-center cursor-none">
      
      {/* Hero Section - 100% Pantalla WebGL */}
      <section className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 w-full h-full">
          <HeroInteractiveCanvas url="/assets/amy-new.webp" />
        </div>
        
        <div className="z-10 text-center mix-blend-overlay pointer-events-none mt-12 md:mt-0">
          <h1 className="text-6xl md:text-8xl tracking-[0.4em] md:tracking-[0.6em] font-light uppercase opacity-90 pl-4 md:pl-8 text-[#E0E0E0]">NAROA</h1>
          <p className="text-xs md:text-sm tracking-[0.3em] md:tracking-[0.4em] mt-6 font-mono opacity-60 text-[#E0E0E0]">PERCEPCIÓN • TENSIÓN • GRAVEDAD</p>
          <p className="mt-12 text-[0.6rem] tracking-[0.3em] opacity-40 text-[#E0E0E0]">BILBAO, ESPAÑA</p>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[0.6rem] tracking-[0.3em] text-[#888] font-mono animate-pulse pointer-events-none mix-blend-difference">
          [ SCROLL TO EXCAVATE ]
        </div>
      </section>

      {/* Galería Inmersiva SOTA */}
      <section className="px-6 py-32 md:p-32 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 max-w-[1800px] w-full bg-[#050505]">
        {artworks.map((art, idx) => (
          <GalleryArtwork 
            key={idx} 
            title={art.title} 
            year={art.year} 
            tech={art.tech} 
            img={art.img} 
          />
        ))}
      </section>

      {/* Footer Inmersivo */}
      <footer className="w-full text-center py-32 border-t border-white/5 bg-[#030303] flex flex-col items-center justify-center gap-4 relative z-10">
        <h4 className="text-xl md:text-2xl tracking-[0.5em] font-light opacity-80 uppercase text-[#E0E0E0]">NAROA</h4>
        <p className="text-[0.6rem] text-[#555] tracking-[0.3em] font-mono uppercase">ESTUDIO & LABORATORIO</p>
        <p className="text-[0.5rem] text-[#333] tracking-[0.2em] mt-8 uppercase font-mono">&copy; 2026 NAROA GUTIÉRREZ GIL | C5-REAL ARCHITECTURE</p>
      </footer>
    </main>
  );
}
