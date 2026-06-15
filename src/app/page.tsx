/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Lenis from 'lenis';
import dynamic from 'next/dynamic';
import TakeoverModal from '@/components/TakeoverModal';
import CommissionFlow from '@/components/CommissionFlow';
import { useThermodynamicAudio } from '@/hooks/useThermodynamicAudio';
import { useInertialScroll } from '@/hooks/useInertialScroll';

const MacroSplatCanvas = dynamic(() => import('@/components/SplatBenchmarkCanvas'), { ssr: false });
const KineticArtwork = dynamic(() => import('@/components/KineticArtwork'), { ssr: false });

const getImageUrl = (src: string) => {
  if (src.startsWith('http')) return src;
  return `/assets/${src}`;
};

const artworks = [
  { src: 'hq-portrait-1-bV-_WHlX.webp', title: 'RETRATO', sub: 'Acrílico sobre pizarra' },
  { src: 'Naroa x16.jpeg', title: 'ALQUIMIA', sub: 'Pizarra negra y pigmento' },
  { src: '615955827_1577822687030480_2386611372471959463_n.jpg', title: 'MATERIA', sub: 'Silencio y color' },
  { src: 'el-gran-dakari-C1tAWAhR.webp', title: 'DAKARI', sub: 'Oro sobre oscuridad' },
  { src: 'hq-johnny-5ueL8eU0.webp', title: 'DEPP', sub: 'Icono cincélico' },
  { src: '601340023_1552126202933462_7815927344957967258_n.jpg', title: 'ESPEJO', sub: 'El alma en piedra' },
  { src: 'geisha-MfRtKWdu.webp', title: 'GEISHA', sub: 'Kintsugi y vacío' },
  { src: '615932964_1577822457030503_2110397705300850911_n.jpg', title: 'EPOXI', sub: 'Textura mineral' },
  { src: 'hq-amy-BRTriASV.webp', title: 'AMY', sub: 'La voz en la piedra' },
];

export default function Home() {
  const [takeoverArtwork, setTakeoverArtwork] = useState<{ src: string; title: string } | null>(null);
  const [takeoverCountdown, setTakeoverCountdown] = useState(4);
  const [webGLReady, setWebGLReady] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [heroReady, setHeroReady] = useState(false);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const { playBrushSound } = useThermodynamicAudio();
  useInertialScroll();

  useEffect(() => {
    const initAudio = () => playBrushSound();
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
    
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") setIsLocal(true);
      setTimeout(() => { setWebGLReady(true); setHeroReady(true); }, 200);
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
      duration: 2.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.7,
    });
    
    let animId: number;
    function raf(time: number) {
      lenis.raf(time);
      const v = lenis.velocity;
      document.documentElement.style.setProperty('--scroll-velocity', v.toString());
      document.documentElement.style.setProperty('--scroll-speed', Math.min(Math.abs(v) * 0.01, 1).toString());
      document.documentElement.style.setProperty('--scroll-chromatic', `${Math.min(Math.abs(v) * 0.18, 22)}px`);
      animId = requestAnimationFrame(raf);
    }
    animId = requestAnimationFrame(raf);
    return () => { lenis.destroy(); cancelAnimationFrame(animId); };
  }, []);

  // Section observer
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
      { threshold: 0.4 }
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
      isHovering = !!(e.target as HTMLElement).closest('.gallery-item') || !!(e.target as HTMLElement).closest('button') || !!(e.target as HTMLElement).closest('input') || !!(e.target as HTMLElement).closest('textarea');
    };

    const tick = () => {
      trailX += (mouseX - trailX) * 0.07;
      trailY += (mouseY - trailY) * 0.07;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${mouseX}px,${mouseY}px,0)`;
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailX}px,${trailY}px,0) scale(${isHovering ? 4.5 : 1})`;
        trailRef.current.style.opacity = isHovering ? '1' : '0.4';
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
    <div className="flex flex-col min-h-screen relative overflow-x-hidden bg-[#020202] cursor-none">
      
      {/* Quantum Cursor */}
      <div ref={cursorRef} className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference" />
      <div ref={trailRef} className="fixed top-0 left-0 w-14 h-14 border-[0.5px] border-white/70 rounded-full pointer-events-none z-[998] -translate-x-1/2 -translate-y-1/2 transition-[transform,opacity] duration-500 ease-out will-change-transform mix-blend-difference" />

      {/* Ambient Particle Field */}
      {webGLReady && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-25 mix-blend-screen">
          <MacroSplatCanvas />
        </div>
      )}

      {/* Minimal Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-[1px] bg-white/40 z-[200] transition-all duration-700 ease-out"
        style={{ width: `${activeIndex < 0 ? 0 : ((activeIndex + 1) / artworks.length) * 100}%` }}
      />

      {/* Side Counter */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-2.5 mix-blend-difference">
        {artworks.map((_, i) => (
          <div 
            key={i} 
            className={`h-px bg-white transition-all duration-700 ease-out ${ i === activeIndex ? 'w-10 opacity-100' : 'w-3 opacity-20' }`} 
          />
        ))}
      </div>

      {/* Hero Section — Monolithic Typography */}
      <section className={`relative w-full h-[100svh] flex flex-col justify-end items-start z-50 overflow-hidden px-8 sm:px-16 pb-16 transition-opacity duration-1000 ${heroReady ? 'opacity-100' : 'opacity-0'}`}>
        <div 
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 100% 80% at 30% 120%, rgba(43,59,229,0.04) 0%, transparent 70%)' }}
        />
        
        {/* Colossal N — the Brand Mark */}
        <div className="relative z-10 pointer-events-none select-none">
          <h1 
            className="font-serif font-light text-white uppercase leading-[0.85] block transition-all duration-700"
            style={{ 
              fontSize: 'clamp(120px, 28vw, 480px)',
              letterSpacing: '-0.04em',
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'translateY(0)' : 'translateY(40px)',
              transitionDelay: '200ms',
              textShadow: 'calc(var(--scroll-chromatic, 0px) * -1) 0 0 rgba(255,30,0,0.6), calc(var(--scroll-chromatic, 0px)) 0 0 rgba(0,220,255,0.6)'
            }}
          >
            N
          </h1>
          
          {/* Name block */}
          <div 
            className="mt-4 ml-1 transition-all duration-700"
            style={{ 
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'translateY(0)' : 'translateY(20px)',
              transitionDelay: '400ms'
            }}
          >
            <p className="text-white/80 font-sans tracking-[0.5em] uppercase text-sm sm:text-base">Naroa Gutiérrez Gil</p>
            <p className="text-white/25 font-sans tracking-[0.3em] uppercase text-xs mt-1.5">Arte sobre pizarra · Bilbao</p>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div
          className="absolute bottom-10 right-14 flex flex-col items-center gap-3 transition-all duration-700 mix-blend-difference"
          style={{ 
            opacity: heroReady ? 0.4 : 0,
            transitionDelay: '800ms'
          }}
        >
          <span className="text-white font-sans text-[9px] tracking-[0.5em] uppercase">Scroll</span>
          <div className="w-px h-12 bg-white/50 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 w-full h-1/2 bg-white"
              style={{ animation: 'slideDown 2s ease-in-out infinite' }}
            />
          </div>
        </div>
      </section>

      {/* Statement del Artista */}
      <section className="relative z-20 w-full min-h-[60svh] flex flex-col justify-center px-8 sm:px-16 bg-[#020202]">
        <div className="max-w-4xl">
          <p className="text-white/40 font-sans tracking-[0.4em] uppercase text-xs mb-8">El Arte de la Precisión</p>
          <h2 className="font-serif text-white text-[5vw] sm:text-[3vw] leading-tight text-balance">
            "No pinto rostros. <span className="text-white/40">Capturo la luz que queda dentro de las personas cuando creen que nadie las está mirando.</span> Cada retrato es un acto de memoria y presencia."
          </h2>
        </div>
      </section>

      {/* Continuous Fullscreen Gallery */}
      <div className="relative z-10 w-full">
        {artworks.map((artwork, i) => (
          <section 
            key={i}
            ref={(el) => { sectionRefs.current[i] = el; }}
            className="gallery-item relative w-full h-[100svh] flex justify-center items-center overflow-hidden group cursor-none"
            onClick={() => triggerTakeover(artwork)}
          >
            {/* Deep Parallax Layer */}
            <div 
              className="absolute inset-[-10%] will-change-transform transform-gpu"
              style={{
                transform: `scale(1.2) translateY(calc(var(--scroll-velocity, 0) * ${i % 2 === 0 ? '-8px' : '8px'}))`
              }}
            >
              <KineticArtwork
                src={resolveSrc(artwork.src)}
                alt={artwork.title}
                priority={i < 3}
                className="group-hover:scale-[1.04] transition-transform duration-[4s] ease-out"
                id={artwork.src.split('.')[0].replace(/[^a-zA-Z0-9-]/g, '')}
              />
            </div>
            
            {/* Layered Atmospheric Gradient */}
            <div className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-[1.5s]"
              style={{
                background: i % 3 === 0
                  ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.4) 100%)'
                  : i % 3 === 1
                  ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.5) 100%)'
                  : 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)'
              }}
            />
            <div className="absolute inset-0 z-10 bg-black/50 group-hover:bg-black/5 transition-colors duration-[1.5s] pointer-events-none" />
            
            {/* Index Number */}
            <span className="absolute top-8 left-10 text-white/15 font-sans text-[11px] tracking-[0.4em] z-20 mix-blend-difference group-hover:text-white/50 transition-colors duration-700">
              {String(i + 1).padStart(2, '0')} / {artworks.length}
            </span>
            
            {/* Typographic Block — Bottom Left */}
            <div className="absolute bottom-10 left-10 sm:left-16 z-20 overflow-hidden">
              <h2 
                className="font-serif uppercase tracking-tighter text-white mix-blend-difference leading-none block will-change-transform"
                style={{ 
                  fontSize: 'clamp(48px, 8vw, 130px)',
                  opacity: i === activeIndex ? 1 : 0.25,
                  transform: `translateX(${i === activeIndex ? '0' : '-20px'}) translateY(calc(var(--scroll-velocity, 0) * ${i % 2 === 0 ? '4px' : '-4px'}))`,
                  transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  textShadow: i === activeIndex 
                    ? 'calc(var(--scroll-chromatic, 0px) * -1) 0 0 rgba(255,30,0,0.5), calc(var(--scroll-chromatic, 0px)) 0 0 rgba(0,220,255,0.5)' 
                    : 'none'
                }}
              >
                {artwork.title}
              </h2>
              <p 
                className="text-white/40 font-sans tracking-[0.25em] uppercase mt-3 group-hover:text-white/70 transition-colors duration-700"
                style={{ 
                  fontSize: '10px',
                  opacity: i === activeIndex ? 1 : 0,
                  transform: i === activeIndex ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.8s 0.2s ease, transform 0.8s 0.2s ease'
                }}
              >
                {artwork.sub}
              </p>
            </div>
          </section>
        ))}
      </div>

      {/* El Proceso Maestría */}
      <section className="relative z-20 w-full py-32 px-8 sm:px-16 bg-[#020202] border-t border-white/5">
        <h3 className="text-white/40 font-sans tracking-[0.4em] uppercase text-xs mb-16 text-center">La Anatomía de un Encargo</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            { step: '01', title: 'AUDITORÍA VISUAL', desc: 'Análisis termodinámico de la fotografía de referencia. Estudio de luces y sombras.' },
            { step: '02', title: 'PIZARRA VASCA', desc: 'Selección manual y preparación de la piedra natural en el taller.' },
            { step: '03', title: 'ALQUIMIA CINCÉLICA', desc: 'Entre 3 y 6 semanas de trabajo hiperrealista con técnica mixta y acrílico.' },
            { step: '04', title: 'KINTSUGI & ENTREGA', desc: 'Barnizado epoxi, certificación de obra y envío protegido nivel museo.' },
          ].map(p => (
            <div key={p.step} className="border border-white/10 p-6 flex flex-col justify-between hover:border-white/40 transition-colors">
              <span className="font-serif text-3xl opacity-30 mb-8">{p.step}</span>
              <div>
                <h4 className="font-sans text-xs tracking-widest uppercase mb-3 text-white">{p.title}</h4>
                <p className="font-sans text-xs opacity-60 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fase 1: Formulario Inteligente (Pricing Configurator) */}
      <section className="relative z-20 w-full min-h-[100svh] flex flex-col justify-center bg-[#020202] border-t border-white/5">
        <CommissionFlow />
      </section>

      {/* Closing Statement */}
      <section className="relative z-20 w-full h-[40svh] flex flex-col justify-center items-center bg-[#020202] border-t border-white/5">
        <div className="text-center">
          <p className="text-white/8 font-serif uppercase tracking-[0.5em]" style={{ fontSize: 'clamp(32px, 6vw, 90px)' }}>Naroa</p>
          <div className="w-px h-16 bg-white/10 mx-auto mt-8 mb-8" />
          <p className="text-white/20 font-sans text-[10px] tracking-[0.5em] uppercase">Bilbao · naroa@naroa.eu</p>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}} />

      <TakeoverModal 
        artwork={takeoverArtwork} 
        countdown={takeoverCountdown} 
        getImageUrl={resolveSrc} 
        onClose={closeTakeover}
      />
    </div>
  );
}