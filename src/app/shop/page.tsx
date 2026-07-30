'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useLenis from '@/hooks/useLenis';
import ScrollReveal from '@/components/ScrollReveal';
import Footer from '@/components/Footer';
import GlobalNavigation from '@/components/GlobalNavigation';
import HeroFluid from '@/components/HeroFluid';
import dynamic from 'next/dynamic';

const CinematicCanvas = dynamic(() => import('@/components/CinematicCanvas'), { ssr: false });
const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false });

export default function ShopPage() {
  useLenis();

  const [takeoverArtwork, setTakeoverArtwork] = useState<{ src: string; title: string; category?: string; desc?: string } | null>(null);

  const artworks = [
    { 
      id: 'paul-newmum', 
      title: 'Paul Newmum', 
      price: '4.500€', 
      src: 'paul_newmum_1783824262669.webp',
      desc: 'Acrílico sobre pizarra vasca recuperada, resina pulida y toques de mica mineral.', 
      status: 'Adquirir Materia',
      availability: 'Disponible',
      dimensions: '40x60 cm',
      material: 'Pizarra Vasco-Lítica'
    },
    { 
      id: 'summer-monroe', 
      title: 'Summer Monroe', 
      price: '3.800€', 
      src: 'summer_monroe_1783824308258.webp',
      desc: 'Retrato hiperrealista con textura Kintsugi en pan de oro y disoluciones abstractas.', 
      status: 'Adquirir Materia',
      availability: 'Disponible',
      dimensions: '30x40 cm',
      material: 'Cola, Acrílico & Oro'
    },
    { 
      id: 'la-famiglia', 
      title: 'La Famiglia', 
      price: '5.200€', 
      src: 'la_famiglia_1783824320607.webp',
      desc: 'Composición colectiva de gran formato sobre soporte lítico de pizarra natural.', 
      status: 'Adquirir Materia',
      availability: 'Disponible',
      dimensions: '60x80 cm',
      material: 'Pizarra Vasco-Lítica'
    }
  ];

  useEffect(() => {
    if (takeoverArtwork) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [takeoverArtwork]);

  const openFullscreenArtwork = (artwork: { src: string; title: string; category?: string; desc?: string }) => {
    setTakeoverArtwork(artwork);
  };

  const closeTakeover = () => {
    setTakeoverArtwork(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden relative">
      <CustomCursor />
      <CinematicCanvas />
      {/* Background Flow Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" />
        <HeroFluid />
      </div>

      <GlobalNavigation />

      <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-40 pb-32">
        <ScrollReveal>
          <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-end mb-24 border-b border-white/10 pb-8 gap-4">
            <div>
              <span className="text-[#2B3BE5] font-mono tracking-[0.4em] uppercase text-[10px] mb-2 block font-bold">
                BÓVEDA TRANSACCIONAL
              </span>
              <h1 className="text-6xl md:text-8xl font-serif font-black uppercase tracking-tighter text-white leading-none">
                Materia
              </h1>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm font-mono text-white/40 uppercase tracking-widest font-bold">
                ADQUISICIÓN DIRECTA
              </p>
              <p className="text-xs text-[#2B3BE5] font-mono uppercase tracking-[0.2em] mt-1 font-bold">
                Reality Level: C5-REAL
              </p>
            </div>
          </header>
        </ScrollReveal>

        {/* Artworks Brutalist Grid */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {artworks.map((obra, index) => (
              <ScrollReveal delay={index * 0.1} key={obra.id}>
                <article 
                  onClick={() => openFullscreenArtwork({ src: obra.src, title: obra.title, category: obra.material, desc: obra.desc })}
                  className="bg-[#0A0A0A] border border-white/10 p-6 hover:border-[#2B3BE5]/50 hover:-translate-y-1 transition-all duration-300 group relative flex flex-col justify-between min-h-[580px] cursor-pointer shadow-2xl"
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase">ID: {obra.id}</span>
                      <span className="font-mono text-[9px] tracking-widest text-[#2B3BE5] uppercase font-bold">{obra.availability}</span>
                    </div>

                    {/* Image Container with Hover Pan */}
                    <div className="relative w-full aspect-[4/5] bg-black border border-white/5 overflow-hidden">
                      <Image
                        src={`/assets/${obra.src}`}
                        alt={obra.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 30vw"
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/50">{obra.material}</span>
                        <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-[#2B3BE5] font-bold opacity-0 group-hover:opacity-100 transition-opacity">VER DETALLE ↗</span>
                      </div>
                    </div>
                    
                    <h2 className="text-3xl font-serif font-black text-white group-hover:text-[#2B3BE5] transition-colors duration-300 uppercase leading-tight">{obra.title}</h2>
                    
                    {/* Collapsed Details - Revealed on Hover */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 group-hover:opacity-100">
                      <div className="overflow-hidden space-y-4">
                        <div className="pt-4">
                          <p className="text-white/60 font-light leading-relaxed text-sm">
                            {obra.desc}
                          </p>
                          <div className="text-[10px] font-mono text-white/40 tracking-wider mt-4">
                            DIMENSIONES: <span className="text-white font-bold">{obra.dimensions}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-6">
                    <span className="text-2xl font-serif font-black text-white">{obra.price}</span>
                    <Link 
                      href={`/contacto?obra=${obra.id}&action=adquirir`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-6 py-3 bg-[#2B3BE5] hover:bg-white text-white hover:text-black font-mono text-[9px] tracking-[0.2em] uppercase transition-all duration-300 rounded-none font-bold shadow-[0_0_15px_rgba(43,59,229,0.2)] hover:shadow-none"
                    >
                      {obra.status}
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Brutalist info banner */}
        <ScrollReveal>
          <div className="border border-white/10 p-8 md:p-12 bg-white/[0.01] flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
            <div className="max-w-2xl space-y-2">
              <h3 className="text-xl font-serif font-black uppercase text-white">¿Deseas encargar una composición personalizada?</h3>
              <p className="text-sm text-white/60 leading-relaxed font-light">
                Naroa trabaja bajo encargo adaptando retratos y motivos a soportes minerales de pizarra vasca específicos. Usa el formulario de contacto para iniciar la co-creación de tu pieza.
              </p>
            </div>
            <Link 
              href="/contacto?action=encargo" 
              className="px-8 py-4 border border-[#2B3BE5] bg-[#2B3BE5] hover:bg-white hover:border-white text-white hover:text-black font-mono text-xs tracking-widest uppercase transition-all duration-300 font-bold shrink-0 shadow-[0_0_20px_rgba(43,59,229,0.3)] hover:shadow-none"
            >
              Iniciar Encargo
            </Link>
          </div>
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
}
