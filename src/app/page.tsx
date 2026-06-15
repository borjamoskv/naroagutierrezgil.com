/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Lenis from 'lenis';
import dynamic from 'next/dynamic';
import TakeoverModal from '@/components/TakeoverModal';
import { useThermodynamicAudio } from '@/hooks/useThermodynamicAudio';
import { useInertialScroll } from '@/hooks/useInertialScroll';

const MacroSplatCanvas = dynamic(() => import('@/components/SplatBenchmarkCanvas'), { ssr: false });
const KineticArtwork = dynamic(() => import('@/components/KineticArtwork'), { ssr: false });

const getImageUrl = (src: string) => {
  if (src.startsWith('http')) return src;
  return `/assets/${src}`;
};

const artworks = [
  { src: 'hq-portrait-1-bV-_WHlX.webp', title: 'NAROA', sub: 'Retrato I' },
  { src: 'Naroa x16.jpeg', title: 'ALQUIMIA', sub: 'Pizarra negra y acrílico' },
  { src: '615955827_1577822687030480_2386611372471959463_n.jpg', title: 'MATERIA', sub: 'Silencio y pigmento' },
  { src: 'el-gran-dakari-C1tAWAhR.webp', title: 'DAKARI', sub: 'Oro sobre noche' },
  { src: 'hq-johnny-5ueL8eU0.webp', title: 'DEPP', sub: 'Icono cincélico' },
  { src: '601340023_1552126202933462_7815927344957967258_n.jpg', title: 'ESPEJO', sub: 'Del alma I' },
  { src: 'geisha-MfRtKWdu.webp', title: 'GEISHA', sub: 'Kintsugi y vacío' },
  { src: '615932964_1577822457030503_2110397705300850911_n.jpg', title: 'TEXTURA', sub: 'Epoxi mineral' },
];

export default function Home() {
  const [takeoverArtwork, setTakeoverArtwork] = useState<{ src: string; title: string } | null>(null);
  const [takeoverCountdown, setTakeoverCountdown] = useState(4);
  const [webGLReady, setWebGLReady] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loaded, setLoaded] = useState(false);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const { playBrushSound } = useThermodynamicAudio();
  useInertialScroll();

  useEffect(() => {
    setTimeout(() => setLoaded(true), 300);
    const initAudio = () => playBrushSound();
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
    
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") setIsLocal(true);
      setTimeout(() => setWebGLReady(true), 300);
    }
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, [playBrushSound]);

  const takeoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const takeoverIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const closeTakeover = () => {
    setTakeoverArtwork(null);
    document.body.style.overflow = '';
    if (takeoverTimeoutRef.current) clearTimeout(takeoverTimeoutRef.current);
    if (takeoverIntervalRef.current) clearInterval(takeoverIntervalRef.current);
  };

  const triggerTakeover = (artwork: { src: string; title: string }) => {
    if (takeoverTimeoutRef.current) clearTimeout(takeoverTimeoutRef.current);
    if (takeoverIntervalRef.current) clearInterval(takeoverIntervalRef.current);
    setTakeoverArtwork(artwork);
    setTakeoverCountdown(4);
    document.body.style.overflow = 'hidden';
    let count = 4;
    takeoverIntervalRef.current = setInterval(() => {
      count -= 1;
      setTakeoverCountdown(count);
    }, 1000);
    takeoverTimeoutRef.current = setTimeout(() => closeTakeover(), 4000);
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.8,
    });
    
    let animId: number;
    function raf(time: number) {
      lenis.raf(time);
      const v = lenis.velocity;
      document.documentElement.style.setProperty('--scroll-velocity', v.toString());
      document.documentElement.style.setProperty('--scroll-speed', Math.min(Math.abs(v) * 0.01, 1).toString());
      document.documentElement.style.setProperty('--scroll-chromatic', `${Math.min(Math.abs(v) * 0.2, 25)}px`);
      animId = requestAnimationFrame(raf);
    }
    animId = requestAnimationFrame(raf);
    return () => { lenis.destroy(); cancelAnimationFrame(animId); };
  }, []);

  // Intersection Observer - detect active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    sectionRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  // Magnetic cursor
  useEffect(() => {
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let trailX = window.innerWidth / 2, trailY = window.innerHeight / 2;
    let isHovering = false;

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isHovering = !!(e.target as HTMLElement).closest('.gallery-item');
    };

    const tick = () => {
      trailX += (mouseX - trailX) * 0.08;
      trailY += (mouseY - trailY) * 0.08;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${mouseX}px,${mouseY}px,0)`;
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailX}px,${trailY}px,0) scale(${isHovering ? 4 : 1})`;
        trailRef.current.style.mixBlendMode = 'difference';
      }
      requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    tick();
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const resolveSrc = (src: string) => {
    if (isLocal) return `/assets/${src}`;
    return getImageUrl(src);
  };

  return (
    <div className={`flex flex-col min-h-screen relative overflow-x-hidden bg-[#020202] cursor-none transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Quantum Cursor System */}
      <div ref={cursorRef} className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[999] -translate-x-1/2 -translate-y-1/2" />
      <div ref={trailRef} className="fixed top-0 left-0 w-16 h-16 border-[0.5px] border-white/60 rounded-full pointer-events-none z-[998] -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ease-out will-change-transform" />

      {/* Ambient WebGL Particle Field */}
      {webGLReady && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-30 mix-blend-screen">
          <MacroSplatCanvas />
        </div>
      )}

      {/* Side Counter - Minimal Progress */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3 mix-blend-difference">
        {artworks.map((_, i) => (
          <div key={i} className={`h-px transition-all duration-700 ease-out bg-white ${ i === activeIndex ? 'w-12 opacity-100' : 'w-4 opacity-30' }`} />
        ))}
      </div>

      {/* Opening Hero - Pure Typography */}
      <section className="relative w-full h-[100svh] flex flex-col justify-end items-start z-50 overflow-hidden px-8 sm:px-16 pb-16">
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-[#020202]" />
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 100%, rgba(43,59,229,0.06) 0%, transparent 100%)' }}
        />
        
        {/* Giant Typographic Mark */}
        <div className="relative z-10 mix-blend-difference pointer-events-none">
          <h1 
            className="text-[22vw] font-serif font-light text-white tracking-[-0.04em] uppercase leading-none block" 
            style={{ 
              textShadow: 'calc(var(--scroll-chromatic, 0px) * -1) 0 0 rgba(255,0,0,0.7), calc(var(--scroll-chromatic, 0px)) 0 0 rgba(0,255,255,0.7)'
            }}
          >
            N
          </h1>
          <h2 className="text-[4vw] sm:text-[2.5vw] font-sans font-light text-white/60 tracking-[0.5em] uppercase ml-2">Naroa Gutiérrez Gil</h2>
          <p className="text-[1.2vw] font-sans text-white/30 tracking-[0.3em] uppercase mt-4 ml-2">Arte sobre pizarra — Kintsugi — Retrato</p>
        </div>
        
        <p className="absolute bottom-10 right-16 text-white/20 tracking-[0.4em] text-[10px] uppercase font-sans mix-blend-difference">
          ↓ Descender
        </p>
      </section>

      {/* Continuous Fullscreen Gallery Scroll */}
      <div className="relative z-10 w-full flex flex-col">
        {artworks.map((artwork, i) => (
          <section 
            key={i}
            ref={(el) => { sectionRefs.current[i] = el; }}
            className="gallery-item relative w-full h-[100svh] flex justify-center items-center overflow-hidden group cursor-none"
            onClick={() => triggerTakeover(artwork)}
          >
            {/* Parallax Kinetic Image */}
            <div 
              className="absolute inset-[-8%] will-change-transform transform-gpu transition-transform duration-100 ease-linear"
              style={{
                transform: `scale(1.16) translateY(calc(var(--scroll-velocity, 0) * ${i % 2 === 0 ? '-6px' : '6px'}))`
              }}
            >
              <KineticArtwork
                src={resolveSrc(artwork.src)}
                alt={artwork.title}
                priority={i < 3}
                className="group-hover:scale-105 transition-transform duration-[3s] ease-out"
                id={artwork.src.split('.')[0].replace(/[^a-zA-Z0-9-]/g, '')}
              />
            </div>
            
            {/* Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 group-hover:from-black/40 group-hover:via-transparent group-hover:to-transparent transition-all duration-1000 z-10 pointer-events-none" />
            
            {/* Section Number */}
            <span className="absolute top-8 left-10 text-white/20 font-sans text-[11px] tracking-[0.4em] z-20 mix-blend-difference">
              {String(i + 1).padStart(2, '0')}
            </span>
            
            {/* Bottom Typographic Block */}
            <div className="absolute bottom-10 left-10 sm:left-16 z-20 pointer-events-none">
              <h2 
                className="text-[10vw] sm:text-[7vw] font-serif uppercase tracking-tighter text-white mix-blend-difference leading-none opacity-30 group-hover:opacity-100 transition-opacity duration-1000 ease-out will-change-opacity"
                style={{
                  textShadow: i === activeIndex ? 'calc(var(--scroll-chromatic, 0px) * -1) 0 0 rgba(255,0,0,0.5), calc(var(--scroll-chromatic, 0px)) 0 0 rgba(0,255,255,0.5)' : 'none'
                }}
              >
                {artwork.title}
              </h2>
              <p className="text-white/30 font-sans text-[11px] tracking-[0.3em] uppercase mt-2 group-hover:text-white/60 transition-colors duration-700">
                {artwork.sub}
              </p>
            </div>
          </section>
        ))}
      </div>

      {/* Closing Void */}
      <section className="relative z-20 w-full h-[50svh] flex flex-col justify-center items-center overflow-hidden bg-black">
        <p className="text-white/10 font-sans tracking-[1em] text-[10px] uppercase">Naroa Gutiérrez Gil</p>
        <p className="text-white/5 font-sans tracking-[0.5em] text-[9px] uppercase mt-3">Bilbao</p>
      </section>

      <TakeoverModal 
        artwork={takeoverArtwork} 
        countdown={takeoverCountdown} 
        getImageUrl={resolveSrc} 
        onClose={closeTakeover}
      />
    </div>
  );
}