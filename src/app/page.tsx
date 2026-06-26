'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import HeroInteractiveCanvas from '@/components/HeroInteractiveCanvas';
import GalleryArtwork from '@/components/GalleryArtwork';
import ScrollyTelling from '@/components/ScrollyTelling';
import SOTAFX from '@/components/SOTAFX';

import { allArtworks } from '@/data/artworks';

export default function Home() {
  const artworks = allArtworks;

  return (
    <main className="w-full flex flex-col items-center cursor-none overflow-x-hidden">
      
      {/* Sistema C5-REAL de Partículas, Lupa y Audio Sensorial */}
      <SOTAFX />

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

      {/* Excavación Termodinámica (Scrollytelling) */}
      <ScrollyTelling />

      {/* Galería Inmersiva SOTA */}
      <section id="galeria" className="px-6 py-32 md:p-32 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 max-w-[1800px] w-full bg-[#050505] relative z-30">
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
