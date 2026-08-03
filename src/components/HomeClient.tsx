'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { artworkData } from '@/lib/artworkData';

const CinematicCanvas = dynamic(() => import('@/components/CinematicCanvas'), { ssr: false });
const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false });
const GlobalNavigation = dynamic(() => import('@/components/GlobalNavigation'));
const Footer = dynamic(() => import('@/components/Footer'));
const PortfolioGrid = dynamic(() => import('@/components/PortfolioGrid'));
const KineticTicker = dynamic(() => import('@/components/KineticTicker').then((m) => m.KineticTicker), { ssr: false });
const VirtualExhibition3D = dynamic(() => import('@/components/VirtualExhibition3D').then((m) => m.VirtualExhibition3D), { ssr: false });

export default function HomeClient({ feedChildren }: { feedChildren?: React.ReactNode }) {
  // Smooth scrolling with Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    let animationId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationId = requestAnimationFrame(raf);
    }
    animationId = requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div id="main-content" className="flex flex-col min-h-screen relative overflow-x-hidden bg-[#0A0A0A] text-[#F5F5F5] selection:bg-[#2B3BE5] selection:text-white">
      <CustomCursor />
      <CinematicCanvas />

      {/* Foreground Content */}
      <div className="relative z-10">
        <GlobalNavigation />

        {/* Minimalist Hero / Header (Alyssa Monks Style) */}
        <header className="w-full flex flex-col items-center justify-center text-center pt-32 pb-12 px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-wide text-[#F5F5F5] mb-4">
            NAROA GUTIÉRREZ GIL
          </h1>
          <h2 className="font-sans text-xs md:text-sm tracking-[0.3em] text-[#F5F5F5]/70 uppercase">
            Contemporary Realism & Natural Slate Art
          </h2>
        </header>

        {/* Kinetic Ticker SOTA */}
        <KineticTicker />

        {/* Virtual 3D Exhibition Banner */}
        <VirtualExhibition3D />

        {/* Alyssa Monks Style Flat Gallery Grid with Filters */}
        <main className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 pb-32">
          <PortfolioGrid />
        </main>

        {/* Alquimia de la Pizarra (Raw Materials Showcase) */}
        <section className="bg-[#050505] py-20 border-t border-b border-white/5 relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-12">
            <div className="text-center mb-16">
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#F59E0B] block mb-2 font-bold">[ MATERIA & PROCESO ]</span>
              <h2 className="font-serif text-3xl md:text-5xl text-[#F5F5F5]">Alquimia de la Pizarra</h2>
              <p className="font-sans text-xs md:text-sm text-[#F5F5F5]/60 max-w-xl mx-auto mt-4 font-light leading-relaxed">
                Cada obra nace de la interacción orgánica entre el retrato hiperrealista y la porosidad mineral de soportes pétreos recuperados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-[#0A0A0A] border border-white/10 rounded-sm hover:border-[#F59E0B]/50 transition-colors group">
                <span className="font-mono text-xl text-[#F59E0B] block mb-3 font-bold">01.</span>
                <h3 className="font-serif text-xl text-[#F5F5F5] mb-2 group-hover:text-[#F59E0B] transition-colors">Pizarra Vasco-Lítica</h3>
                <p className="font-sans text-xs text-[#F5F5F5]/60 leading-relaxed font-light">
                  Pizarras centenarias recuperadas de caseríos y tejados históricos del País Vasco. Superficies labradas por el clima.
                </p>
              </div>

              <div className="p-8 bg-[#0A0A0A] border border-white/10 rounded-sm hover:border-[#2B3BE5]/50 transition-colors group">
                <span className="font-mono text-xl text-[#2B3BE5] block mb-3 font-bold">02.</span>
                <h3 className="font-serif text-xl text-[#F5F5F5] mb-2 group-hover:text-[#2B3BE5] transition-colors">Escamas de Mica Mineral</h3>
                <p className="font-sans text-xs text-[#F5F5F5]/60 leading-relaxed font-light">
                  Láminas minerales translúcidas encoladas que reflejan la luz ambiente con destellos naturales cambiantes.
                </p>
              </div>

              <div className="p-8 bg-[#0A0A0A] border border-white/10 rounded-sm hover:border-[#F59E0B]/50 transition-colors group">
                <span className="font-mono text-xl text-[#F59E0B] block mb-3 font-bold">03.</span>
                <h3 className="font-serif text-xl text-[#F5F5F5] mb-2 group-hover:text-[#F59E0B] transition-colors">Kintsugi Accidental</h3>
                <p className="font-sans text-xs text-[#F5F5F5]/60 leading-relaxed font-light">
                  Resinas de oro y pigmentos cargados que cicatrizan las vetas y grietas naturales de la losa mineral.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WordPress Feed section */}
        <div className="bg-[#0A0A0A] pt-12 pb-24">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-[#F5F5F5]">Diario de Taller</h2>
            <div className="w-12 h-[1px] bg-[#F59E0B]/50 mx-auto mt-4"></div>
          </div>
          {feedChildren}
        </div>

        <Footer />
      </div>
    </div>
  );
}
