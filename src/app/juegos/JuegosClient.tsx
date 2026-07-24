'use client';

import React, { useState } from 'react';
import GlobalNavigation from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import HeroFluid from '@/components/HeroFluid';
import ScrollReveal from '@/components/ScrollReveal';
import RestauradorGame from '@/components/games/RestauradorGame';
import OcaGame from '@/components/games/OcaGame';
import AaronMirrorGame from '@/components/games/AaronMirrorGame';
import useLenis from '@/hooks/useLenis';

export default function JuegosClient() {
  const [activeTab, setActiveTab] = useState<'restaurador' | 'oca' | 'aaron'>('restaurador');
  useLenis();

  return (
    <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" />
        <HeroFluid />
      </div>

      <GlobalNavigation />

      <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-36 pb-24">
        {/* HEADER SECTION */}
        <ScrollReveal>
          <header className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <span className="text-[#2B3BE5] font-mono tracking-[0.4em] uppercase text-xs block">
              [ SALA DE JUEGOS INTERACTIVA // LABORATOIRE SOTA ]
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif font-light tracking-wide uppercase text-white">
              Juegos y Experiencias
            </h1>
            <p className="text-white/60 font-sans text-sm sm:text-base font-light leading-relaxed">
              Intervén las obras con Kintsugi digital, recorre la trayectoria de Naroa Gutiérrez Gil o descubre tu alter ego mineral.
            </p>
          </header>
        </ScrollReveal>

        {/* TABS SELECTOR */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveTab('restaurador')}
            className={`px-6 py-3 font-mono text-xs uppercase tracking-wider rounded-full transition-all duration-300 border ${
              activeTab === 'restaurador'
                ? 'bg-[#2B3BE5] text-white border-[#2B3BE5] shadow-[0_0_20px_rgba(43,59,229,0.4)] font-bold'
                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            👨‍🎨 1. El Restaurador Desastroso
          </button>
          <button
            onClick={() => setActiveTab('oca')}
            className={`px-6 py-3 font-mono text-xs uppercase tracking-wider rounded-full transition-all duration-300 border ${
              activeTab === 'oca'
                ? 'bg-[#2B3BE5] text-white border-[#2B3BE5] shadow-[0_0_20px_rgba(43,59,229,0.4)] font-bold'
                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            🦆 2. Oca de las Artes (DiviNos VaiVenes)
          </button>
          <button
            onClick={() => setActiveTab('aaron')}
            className={`px-6 py-3 font-mono text-xs uppercase tracking-wider rounded-full transition-all duration-300 border ${
              activeTab === 'aaron'
                ? 'bg-[#2B3BE5] text-white border-[#2B3BE5] shadow-[0_0_20px_rgba(43,59,229,0.4)] font-bold'
                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            🪞 3. El Espejo de Aaron
          </button>
        </div>

        {/* GAME CONTENT CONTAINER */}
        <div className="transition-all duration-500">
          {activeTab === 'restaurador' && <RestauradorGame />}
          {activeTab === 'oca' && <OcaGame />}
          {activeTab === 'aaron' && <AaronMirrorGame />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
