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
const SplatPhysicsTester = dynamic(() => import('@/components/SplatPhysicsTester'), { ssr: false });
const KineticArtwork = dynamic(() => import('@/components/KineticArtwork'), { ssr: false });

const getImageUrl = (src: string) => {
  if (src.startsWith('http')) return src;
  return `/assets/${src}`;
};

// Simplified array for the Monolithic Gallery (only the strongest pieces)
const baseArtworks = [
  { src: 'hq-portrait-1-bV-_WHlX.webp', title: 'Retrato I' },
  { src: 'Naroa x16.jpeg', title: 'Alquimia en Pizarra' },
  { src: '615955827_1577822687030480_2386611372471959463_n.jpg', title: 'Materia y Silencio' },
  { src: 'el-gran-dakari-C1tAWAhR.webp', title: 'El Gran Dakari' },
  { src: '601340023_1552126202933462_7815927344957967258_n.jpg', title: 'Espejo del Alma' },
  { src: 'hq-johnny-5ueL8eU0.webp', title: 'Johnny Depp' },
  { src: '616994481_1577822437030505_8337096648607967605_n.jpg', title: 'Fusión Material' },
  { src: 'geisha-MfRtKWdu.webp', title: 'Geisha' },
  { src: '615932964_1577822457030503_2110397705300850911_n.jpg', title: 'Textura Epoxi' }
];

export default function Home() {
  const [artworks, setArtworks] = useState(baseArtworks);
  const [takeoverArtwork, setTakeoverArtwork] = useState<{ src: string; title: string } | null>(null);
  const [takeoverCountdown, setTakeoverCountdown] = useState(4);
  const [webGLReady, setWebGLReady] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const { playBrushSound } = useThermodynamicAudio();
  useInertialScroll();

  useEffect(() => {
    const initAudio = () => playBrushSound();
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, [playBrushSound]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes("local")) setIsLocal(true);
      
      const t = setTimeout(() => setWebGLReady(true), 100);
      return () => clearTimeout(t);
    }
  }, []);

  const takeoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const takeoverIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const closeTakeover = () => {
    setTakeoverArtwork(null);
    document.body.style.overflow = '';
    if (takeoverTimeoutRef.current) clearTimeout(takeoverTimeoutRef.current);
    if (takeoverIntervalRef.current) clearInterval(takeoverIntervalRef.current);
  };

  const triggerTakeover = (artwork: { src: string; title: string }) => {
    setTakeoverArtwork(artwork);
    setTakeoverCountdown(4);
    document.body.style.overflow = 'hidden';

    let count = 4;
    takeoverIntervalRef.current = setInterval(() => {
      count -= 1;
      setTakeoverCountdown(count);
    }, 1000);

    takeoverTimeoutRef.current = setTimeout(() => {
      closeTakeover();
    }, 4000);
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2,
    });
    
    let animationId: number;
    function raf(time: number) {
      lenis.raf(time);
      const velocity = lenis.velocity;
      if (typeof window !== 'undefined') {
        (window as any).__scrollVelocity = velocity;
        document.documentElement.style.setProperty('--scroll-velocity', velocity.toString());
        document.documentElement.style.setProperty('--scroll-chromatic', `${Math.min(Math.abs(velocity) * 0.15, 20)}px`);
      }
      animationId = requestAnimationFrame(raf);
    }
    animationId = requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailX = window.innerWidth / 2;
    let trailY = window.innerHeight / 2;
    let isHovering = false;

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const target = e.target as HTMLElement;
      isHovering = !!target.closest('.gallery-item');
    };

    const animateCursor = () => {
      trailX += (mouseX - trailX) * 0.1;
      trailY += (mouseY - trailY) * 0.1;
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailX}px, ${trailY}px, 0) scale(${isHovering ? 3 : 1})`;
        trailRef.current.style.mixBlendMode = isHovering ? 'difference' : 'normal';
      }
      requestAnimationFrame(animateCursor);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    animateCursor();
    
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const resolveSrc = (src: string) => {
    const url = getImageUrl(src);
    if (isLocal && url.startsWith("/")) return `/assets/${src}`;
    return url;
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden selection:bg-transparent selection:text-white bg-[#030303] cursor-none">
      
      {/* Quantum Cursor */}
      <div ref={cursorRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference" />
      <div ref={trailRef} className="fixed top-0 left-0 w-12 h-12 border-[0.5px] border-white/50 rounded-full pointer-events-none z-[998] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out will-change-transform" />

      {/* Pure WebGL Background */}
      {webGLReady && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
          <MacroSplatCanvas />
        </div>
      )}

      {/* Hero Monolith */}
      <section className="relative w-full h-[100svh] flex flex-col justify-center items-center z-50 bg-[#030303]">
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center mix-blend-difference pointer-events-none">
          <h1 
            className="text-[18vw] font-serif font-light text-white tracking-tighter uppercase leading-none opacity-90" 
            style={{ 
              transform: 'skewY(calc(var(--scroll-velocity, 0) * 0.5deg))',
              textShadow: 'calc(var(--scroll-chromatic, 0px) * -1) 0 0 rgba(255,0,0,0.8), calc(var(--scroll-chromatic, 0px) * 1) 0 0 rgba(0,255,255,0.8)'
            }}
          >
            Naroa
          </h1>
          <h2 
            className="text-[18vw] font-serif font-light text-white tracking-tighter uppercase leading-[0.8] opacity-90" 
            style={{ 
              transform: 'skewY(calc(var(--scroll-velocity, 0) * -0.5deg))',
              textShadow: 'calc(var(--scroll-chromatic, 0px) * 1) 0 0 rgba(255,0,0,0.8), calc(var(--scroll-chromatic, 0px) * -1) 0 0 rgba(0,255,255,0.8)'
            }}
          >
            Gutiérrez
          </h2>
        </div>
        <p className="absolute bottom-12 text-white/30 tracking-[0.5em] text-[10px] uppercase mix-blend-difference font-sans">
          Desciende
        </p>
      </section>

      {/* Monolithic Continuous Scroll Gallery */}
      <div ref={galleryRef} className="relative z-10 w-full flex flex-col">
        {artworks.map((artwork, i) => (
          <section 
            key={i} 
            className="gallery-item relative w-full h-[100svh] flex justify-center items-center overflow-hidden group cursor-none"
            onClick={() => triggerTakeover(artwork)}
          >
            {/* Parallax Image Container */}
            <div 
              className="absolute inset-0 w-full h-[120%] -top-[10%] will-change-transform transform-gpu"
              style={{
                transform: `translateY(calc(var(--scroll-velocity, 0) * ${i % 2 === 0 ? '-8px' : '8px'}))`
              }}
            >
              <KineticArtwork
                src={resolveSrc(artwork.src)}
                alt={artwork.title}
                priority={i < 2}
                className="transition-transform duration-[2s] ease-out group-hover:scale-105"
                id={artwork.src.split('.')[0].replace(/[^a-zA-Z0-9-]/g, '')}
              />
            </div>
            
            {/* Darker overlay on un-hovered */}
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/10 transition-colors duration-1000 z-10 pointer-events-none" />
            
            {/* Massive Typographic Title */}
            <h2 
              className="relative z-20 text-[10vw] font-serif uppercase tracking-tighter text-white mix-blend-difference opacity-40 group-hover:opacity-100 transition-all duration-[1s] ease-out pointer-events-none drop-shadow-2xl text-center px-4"
              style={{
                transform: `translateY(calc(var(--scroll-velocity, 0) * ${i % 2 === 0 ? '5px' : '-5px'}))`
              }}
            >
              {artwork.title}
            </h2>
          </section>
        ))}
      </div>

      <TakeoverModal 
        artwork={takeoverArtwork} 
        countdown={takeoverCountdown} 
        getImageUrl={resolveSrc} 
        onClose={closeTakeover}
      />
    </div>
  );
}