'use client';

import React from 'react';
import Link from 'next/link';
import useLenis from '@/hooks/useLenis';
import HeroFluid from '@/components/HeroFluid';
import ScrollReveal from '@/components/ScrollReveal';
import Footer from '@/components/Footer';

export default function ShopPage() {
  useLenis();

  const artworks = [
    { id: 'paul-newmum', title: 'Paul Newmum', price: '4.500€', desc: 'Acrílico sobre pizarra vasca recuperada, resina pulida y toques de mica mineral.', status: 'Adquirir Materia' },
    { id: 'summer-monroe', title: 'Summer Monroe', price: '3.800€', desc: 'Retrato hiperrealista con textura Kintsugi en pan de oro y disoluciones abstractas.', status: 'Adquirir Materia' },
    { id: 'la-famiglia', title: 'La Famiglia', price: '5.200€', desc: 'Composición colectiva de gran formato sobre soporte lítico de pizarra natural.', status: 'Adquirir Materia' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden relative">
      {/* Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" />
        <HeroFluid />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 p-6 sm:p-12 mix-blend-difference flex justify-between items-center">
        <Link 
          href="/" 
          className="group flex items-center gap-4 text-white/50 hover:text-white transition-colors duration-500"
        >
          <div className="w-8 h-[1px] bg-white/30 group-hover:bg-[#2B3BE5] group-hover:w-16 transition-all duration-700" />
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase">Retorno al Laboratorio</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/biografia" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">Biografía</Link>
          <Link href="/contacto" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">Contacto</Link>
          <Link href="/recreo" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">El ReCreo</Link>
        </div>
      </nav>

      <main id="main-content" className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 pt-40 pb-32">
        <ScrollReveal>
          <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-end mb-20 border-b border-[#2B3BE5]/30 pb-8 gap-4">
            <div>
              <span className="text-[#2B3BE5] font-mono tracking-[0.4em] uppercase text-[10px] mb-2 block">
                Adquisición de Activos Físicos
              </span>
              <h1 className="text-5xl md:text-7xl font-serif font-black uppercase tracking-tight text-white leading-none">
                Bóveda
              </h1>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm font-mono text-white/40 uppercase tracking-widest">
                Estado Transaccional
              </p>
              <p className="text-xs text-[#F59E0B] font-mono uppercase tracking-[0.2em] mt-1">
                Reality Level: C5-REAL
              </p>
            </div>
          </header>
        </ScrollReveal>

        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.map((obra, index) => (
              <ScrollReveal delay={index * 0.1} key={obra.id}>
                <article className="bg-[#0A0A0A] border border-white/10 rounded-sm p-8 hover:border-[#2B3BE5]/50 transition-all duration-700 group relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[400px] cursor-pointer">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-[#2B3BE5] scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                  
                  <div className="space-y-4">
                    <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase">Hash: {obra.id}</span>
                    <h2 className="text-3xl font-serif text-white group-hover:text-[#2B3BE5] transition-colors duration-500 uppercase leading-none">{obra.title}</h2>
                    <p className="text-white/60 font-light leading-relaxed text-sm pt-2">
                      {obra.desc}
                    </p>
                  </div>

                  <div className="pt-8 flex items-center justify-between">
                    <span className="text-2xl font-serif font-medium text-white">{obra.price}</span>
                    <button className="px-5 py-2.5 bg-[#2B3BE5] hover:bg-white text-white hover:text-black font-mono text-[9px] tracking-[0.2em] uppercase rounded-sm transition-all duration-500 shadow-[0_0_15px_rgba(43,59,229,0.3)]">
                      {obra.status}
                    </button>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
