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
        <header className="w-full flex flex-col items-center justify-center text-center pt-32 pb-16 px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-wide text-[#F5F5F5] mb-4">
            NAROA GUTIÉRREZ GIL
          </h1>
          <h2 className="font-sans text-xs md:text-sm tracking-[0.3em] text-[#F5F5F5]/70 uppercase">
            Contemporary Realism
          </h2>
        </header>

        {/* Alyssa Monks Style Flat Gallery Grid with Filters */}
        <main className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 pb-32">
          <PortfolioGrid />
        </main>

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
