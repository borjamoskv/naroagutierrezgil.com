'use client';

import React from 'react';
import Link from 'next/link';
import useLenis from '@/hooks/useLenis';
import HeroFluid from '@/components/HeroFluid';
import ScrollReveal from '@/components/ScrollReveal';
import Footer from '@/components/Footer';
import GlobalNavigation from '@/components/GlobalNavigation';

export default function RecreoPage() {
  useLenis();

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden relative">
      {/* Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" />
        <HeroFluid />
      </div>

      <GlobalNavigation />


      <main id="main-content" className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 pt-40 pb-32">
        <ScrollReveal>
          <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-end mb-20 border-b border-[#2B3BE5]/30 pb-8 gap-4">
            <div>
              <span className="text-[#2B3BE5] font-mono tracking-[0.4em] uppercase text-[10px] mb-2 block">
                Pedagogía del Caos & Kintsugi Pedagógico
              </span>
              <h1 className="text-5xl md:text-7xl font-serif font-black uppercase tracking-tight text-white leading-none">
                El ReCreo
              </h1>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm font-mono text-white/40 uppercase tracking-widest">
                Educación Estructural
              </p>
              <p className="text-xs text-[#F59E0B] font-mono uppercase tracking-[0.2em] mt-1">
                Estado: C5-REAL
              </p>
            </div>
          </header>
        </ScrollReveal>

        <section className="mb-20 space-y-12">
          <ScrollReveal delay={0.1}>
            <div className="max-w-3xl text-lg sm:text-xl font-light text-white/60 leading-relaxed">
              <p>
                Un espacio de aprendizaje no normativo donde el <strong className="text-white">error se transmuta en materia de sanación</strong>. No enseñamos reglas académicas estáticas, guiamos la colisión física con el soporte mineral.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            <ScrollReveal delay={0.15}>
              <article className="bg-[#0A0A0A] border border-white/10 rounded-sm p-8 sm:p-10 hover:border-[#2B3BE5]/50 transition-all duration-700 group relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[350px]">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#2B3BE5] scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                <div className="space-y-4">
                  <span className="font-mono text-[9px] tracking-widest text-[#F59E0B] uppercase">Módulo 01</span>
                  <h3 className="text-2xl font-serif text-white group-hover:text-[#2B3BE5] transition-colors duration-500 uppercase">Taller de Técnica PBR</h3>
                  <p className="text-white/60 font-light leading-relaxed text-sm">
                    Transducción de pigmentos físicos a materiales interactivos tridimensionales. Dominio de la refracción y el reflejo de luz HDRI sobre oro, resinas pulidas y mica mineral.
                  </p>
                </div>
                <div className="pt-8">
                  <button className="px-6 py-3 border border-white/10 hover:border-white hover:bg-white hover:text-black font-mono text-[9px] tracking-[0.3em] uppercase rounded-sm transition-all duration-500 w-full text-center">
                    Reservar Plaza
                  </button>
                </div>
              </article>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <article className="bg-[#0A0A0A] border border-white/10 rounded-sm p-8 sm:p-10 hover:border-[#2B3BE5]/50 transition-all duration-700 group relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[350px]">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#2B3BE5] scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                <div className="space-y-4">
                  <span className="font-mono text-[9px] tracking-widest text-[#F59E0B] uppercase">Módulo 02</span>
                  <h3 className="text-2xl font-serif text-white group-hover:text-[#2B3BE5] transition-colors duration-500 uppercase">Escaneo Fotogramétrico</h3>
                  <p className="text-white/60 font-light leading-relaxed text-sm">
                    De lienzo 2D a nube de puntos 3D (Gaussian Splats). Captura volumétrica con rigor termodinámico, iluminada por focos direccionales y lista para interacción kinetica.
                  </p>
                </div>
                <div className="pt-8">
                  <button className="px-6 py-3 border border-white/10 hover:border-white hover:bg-white hover:text-black font-mono text-[9px] tracking-[0.3em] uppercase rounded-sm transition-all duration-500 w-full text-center">
                    Reservar Plaza
                  </button>
                </div>
              </article>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
