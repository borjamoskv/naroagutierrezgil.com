'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import GlobalNavigation from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import PortfolioGrid from '@/components/PortfolioGrid';

const CinematicCanvas = dynamic(() => import('@/components/CinematicCanvas'), { ssr: false });
const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false });

export default function ObraClient() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden relative">
      <CustomCursor />
      <CinematicCanvas />
      <GlobalNavigation />

      <main id="main-content" className="relative z-10 mx-auto pt-36 pb-24">
        {/* HEADER SECTION */}
        <header className="text-center max-w-4xl mx-auto mb-16 space-y-4 px-6">
          <span className="text-[#F5F5F5]/60 font-mono tracking-[0.4em] uppercase text-xs block border-b border-white/10 pb-2">
            [ CATÁLOGO DE OBRA ]
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-light tracking-wide text-[#F5F5F5] leading-none">
            Obra Pictórica
          </h1>
          <p className="text-[#F5F5F5]/70 font-sans text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">
            Explora las colecciones en técnica mixta sobre pizarra centenaria de tejado vasco, Kintsugi accidental, papel poliéster y escamas de mica mineral.
          </p>
        </header>

        {/* ARTWORK GRID */}
        <PortfolioGrid />

        {/* CUSTOM COMMISSION CALL TO ACTION */}
        <div className="mt-20 px-6 max-w-5xl mx-auto">
          <div className="p-10 sm:p-16 bg-[#050505] border border-white/10 rounded-sm text-center space-y-6 relative overflow-hidden shadow-md">
            <span className="text-[#F59E0B] font-mono text-[10px] tracking-[0.4em] uppercase block font-bold">
              [ CO-CREACIÓN DE OBRAS PERSONALIZADAS ]
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#F5F5F5] font-light tracking-wide">
              ¿Deseas encargar una obra única sobre pizarra?
            </h2>
            <p className="text-[#F5F5F5]/70 font-sans text-sm max-w-xl mx-auto leading-relaxed">
              Cada encargo inicia con una conversación directa. Naroa cincela tu retrato sobre pizarra centenaria vasca, resina epoxi y Kintsugi.
            </p>
            <div className="pt-4">
              <Link
                href="/contacto?action=encargo"
                className="inline-block px-10 py-4 bg-[#F59E0B] hover:bg-[#2B3BE5] text-[#0A0A0A] hover:text-white font-sans text-xs uppercase tracking-[0.2em] font-bold rounded-sm transition-all duration-300"
              >
                Configurar Encargo
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
