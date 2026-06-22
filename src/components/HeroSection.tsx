'use client';

import { RefObject } from 'react';
import dynamic from 'next/dynamic';

const HeroInteractiveCanvas = dynamic(() => import('@/components/HeroInteractiveCanvas'), { ssr: false });

interface HeroSectionProps {
  resolveSrc: (src: string) => string;
  heroSectionRef: RefObject<HTMLDivElement | null>;
  descenderRef: RefObject<HTMLDivElement | null>;
}

export default function HeroSection({ resolveSrc, heroSectionRef, descenderRef }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[180vh] bg-[#050505]">
      <section
        ref={heroSectionRef}
        style={{ transform: 'translateY(0%)' }}
        className="sticky top-0 w-full h-[100svh] flex flex-col justify-center items-center overflow-hidden z-50 bg-[#050505] will-change-transform"
      >
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <HeroInteractiveCanvas url={resolveSrc('naroa-portrait-new.webp')} />
        </div>

        {/* Monumental Hero Typography Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center z-20 text-center pointer-events-none px-4">
          <h1 className="font-brutal-huge text-8xl sm:text-[14rem] text-white mix-blend-difference select-none animate-[fadeIn_2.0s_ease-out_both] delay-500 tracking-tighter">
            NAROA
          </h1>
        </div>

        {/* Gravity indicator */}
        <div
          ref={descenderRef}
          style={{ opacity: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 transition-opacity duration-300 animate-[fadeIn_2.5s_ease-out_both] delay-[1000ms]"
        >
          <div className="w-px h-16 bg-white/25 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white animate-[translateY_2.5s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
          </div>
        </div>
      </section>
    </div>
  );
}
