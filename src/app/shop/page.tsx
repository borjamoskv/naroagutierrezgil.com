'use client';

import React from 'react';
import Link from 'next/link';
import useLenis from '@/hooks/useLenis';
import ScrollReveal from '@/components/ScrollReveal';
import Footer from '@/components/Footer';
import GlobalNavigation from '@/components/GlobalNavigation';

export default function ShopPage() {
  useLenis();

  const artworks = [
    { 
      id: 'paul-newmum', 
      title: 'Paul Newmum', 
      price: '4.500€', 
      desc: 'Acrílico sobre pizarra vasca recuperada, resina pulida y toques de mica mineral.', 
      status: 'Adquirir Materia',
      availability: 'Disponible',
      dimensions: '40x60 cm'
    },
    { 
      id: 'summer-monroe', 
      title: 'Summer Monroe', 
      price: '3.800€', 
      desc: 'Retrato hiperrealista con textura Kintsugi en pan de oro y disoluciones abstractas.', 
      status: 'Adquirir Materia',
      availability: 'Disponible',
      dimensions: '30x40 cm'
    },
    { 
      id: 'la-famiglia', 
      title: 'La Famiglia', 
      price: '5.200€', 
      desc: 'Composición colectiva de gran formato sobre soporte lítico de pizarra natural.', 
      status: 'Adquirir Materia',
      availability: 'Disponible',
      dimensions: '60x80 cm'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden relative">
      {/* Background Grid Lines (Brutalist Architecture) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <GlobalNavigation />

      <main id="main-content" className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 pt-40 pb-32">
        <ScrollReveal>
          <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-end mb-24 border-b-2 border-black pb-8 gap-4">
            <div>
              <span className="text-[#2B3BE5] font-mono tracking-[0.4em] uppercase text-[10px] mb-2 block font-bold">
                BÓVEDA TRANSACCIONAL
              </span>
              <h1 className="text-6xl md:text-8xl font-serif font-black uppercase tracking-tighter text-black leading-none">
                Materia
              </h1>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm font-mono text-black/40 uppercase tracking-widest font-bold">
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
                <article className="bg-white border-2 border-black p-8 hover:shadow-[8px_8px_0px_0px_#2B3BE5] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 group relative flex flex-col justify-between min-h-[460px] cursor-pointer">
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-black/10 pb-4">
                      <span className="font-mono text-[9px] tracking-widest text-black/40 uppercase">ID: {obra.id}</span>
                      <span className="font-mono text-[9px] tracking-widest text-[#2B3BE5] uppercase font-bold">{obra.availability}</span>
                    </div>
                    
                    <h2 className="text-3xl font-serif font-black text-black group-hover:text-[#2B3BE5] transition-colors duration-300 uppercase leading-tight">{obra.title}</h2>
                    
                    <p className="text-black/60 font-light leading-relaxed text-sm">
                      {obra.desc}
                    </p>

                    <div className="text-[10px] font-mono text-black/40 tracking-wider">
                      DIMENSIONES: <span className="text-black font-bold">{obra.dimensions}</span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-black/10 flex items-center justify-between">
                    <span className="text-2xl font-serif font-black text-black">{obra.price}</span>
                    <Link 
                      href={`/contacto?obra=${obra.id}&action=adquirir`}
                      className="px-6 py-3 bg-black hover:bg-[#2B3BE5] text-white hover:text-white font-mono text-[9px] tracking-[0.2em] uppercase transition-all duration-300 rounded-none font-bold"
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
          <div className="border-2 border-black p-8 md:p-12 bg-[#2B3BE5]/5 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
            <div className="max-w-2xl space-y-2">
              <h3 className="text-xl font-serif font-black uppercase">¿Deseas encargar una composición personalizada?</h3>
              <p className="text-sm text-black/70 leading-relaxed font-light">
                Naroa trabaja bajo encargo adaptando retratos and motivos a soportes minerales de pizarra vasca específicos. Utiliza la calculadora del formulario para estimar el valor de tu materia.
              </p>
            </div>
            <Link 
              href="/contacto?action=encargo" 
              className="px-8 py-4 border-2 border-black bg-black text-white hover:bg-white hover:text-black font-mono text-xs tracking-widest uppercase transition-all duration-300 font-bold shrink-0"
            >
              Iniciar Encargo
            </Link>
          </div>
        </ScrollReveal>
      </main>

      {/* Footer wrapping with black background to anchor the page */}
      <div className="bg-[#050505] text-[#EAEAEA]">
        <Footer />
      </div>
    </div>
  );
}
