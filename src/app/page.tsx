/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Lenis from 'lenis';
import dynamic from 'next/dynamic';
import DepthHUD from '@/components/DepthHUD';
import SOTAFX from '@/components/SOTAFX';
import Mica from '@/components/Mica';
import HeroFluid from '@/components/HeroFluid';
import ScrollyTelling from '@/components/ScrollyTelling';
import InteractiveStudio from '@/components/InteractiveStudio';
import TakeoverModal from '@/components/TakeoverModal';
import Footer from '@/components/Footer';
import AnimatedHeroBackground from '@/components/AnimatedHeroBackground';

const WebGLBackground = dynamic(() => import('@/components/WebGLBackground'), { ssr: false });
const PaintTrail = dynamic(() => import('@/components/PaintTrail'), { ssr: false });
const MacroSplatCanvas = dynamic(() => import('@/components/SplatBenchmarkCanvas'), { ssr: false });
const SplatPhysicsTester = dynamic(() => import('@/components/SplatPhysicsTester'), { ssr: false });
const KineticArtwork = dynamic(() => import('@/components/KineticArtwork'), { ssr: false });
const ThreeDCarousel = dynamic(() => import('@/components/ThreeDCarousel'), { ssr: false });

const getImageUrl = (src: string) => {
  if (src.startsWith('http')) {
    return src;
  }
  return `/assets/${src}`;
};

const baseArtworks = [
  // Local Original Facebook/HQ Scans
  { src: 'Naroa x16.jpeg', title: 'Alquimia en Pizarra', span: 'col-span-1 md:col-span-10 md:col-start-2 md:row-span-2 aspect-[4/5]' },
  { src: '601340023_1552126202933462_7815927344957967258_n.jpg', title: 'Espejo del Alma I', span: 'col-span-1 md:col-span-5 md:col-start-1 mt-0 md:mt-32 aspect-[3/4]' },
  { src: '608211438_1562089535270462_2827127275272133326_n.jpg', title: 'Dama de la Pizarra', span: 'col-span-1 md:col-span-6 md:col-start-7 mt-0 md:-mt-20 aspect-square' },
  { src: '612329591_1571120784367337_8798688892093004057_n.jpg', title: 'Facciones del Silencio', span: 'col-span-1 md:col-span-7 md:col-start-3 mt-12 md:mt-40 aspect-[16/9]' },
  { src: '615438426_1577822580363824_2923463327956560352_n.jpg', title: 'Retrato en Tensión', span: 'col-span-1 md:col-span-4 md:col-start-1 mt-0 md:mt-24 aspect-[4/5]' },
  { src: '615443765_1577822577030491_9008867371114744175_n.jpg', title: 'Estudio de Luz', span: 'col-span-1 md:col-span-5 md:col-start-8 mt-0 md:-mt-48 aspect-[3/4]' },
  { src: '615955827_1577822687030480_2386611372471959463_n.jpg', title: 'Materia y Silencio', span: 'col-span-1 md:col-span-12 md:col-start-1 mt-12 md:mt-32 aspect-[21/9]' },
  { src: '616115287_1577822747030474_1432330062205548806_n.jpg', title: 'Retrato de Fama I', span: 'col-span-1 md:col-span-6 md:col-start-2 mt-0 aspect-square' },
  { src: '616822144_1580323063447109_589182952237233174_n.jpg', title: 'Retrato del Viento', span: 'col-span-1 md:col-span-4 md:col-start-9 mt-0 md:mt-40 aspect-[4/5]' },
  { src: '622453257_1583899099756172_4197872465466826396_n.jpg', title: 'Mirada del Tiempo', span: 'col-span-1 md:col-span-8 md:col-start-3 mt-12 md:mt-24 aspect-[16/10]' },
  { src: '292544889_3277546379149645_1460977192858455652_n.jpg', title: 'Proceso I', span: 'col-span-1 md:col-span-3 md:col-start-1 mt-0 md:mt-12 aspect-[3/4]' },
  { src: '594972277_1543116283834454_8672784625256696657_n.jpg', title: 'Proceso II', span: 'col-span-1 md:col-span-3 md:col-start-5 mt-0 md:-mt-20 aspect-square' },
  { src: '600258291_1552125946266821_6847049145049928090_n.jpg', title: 'Proceso III', span: 'col-span-1 md:col-span-3 md:col-start-9 mt-0 md:mt-32 aspect-[4/5]' },
  { src: '615932964_1577822457030503_2110397705300850911_n.jpg', title: 'Textura Epoxi', span: 'col-span-1 md:col-span-10 md:col-start-2 mt-12 md:mt-32 aspect-video' },
  { src: '616035859_1577822453697170_3937842745320602184_n.jpg', title: 'Corte Mineral', span: 'col-span-1 md:col-span-6 md:col-start-1 mt-0 md:mt-20 aspect-square' },
  { src: '616198291_1577822413697174_3337151405885426240_n.jpg', title: 'Superficie Táctil', span: 'col-span-1 md:col-span-5 md:col-start-8 mt-0 md:-mt-10 aspect-[3/4]' },
  { src: '616994481_1577822437030505_8337096648607967605_n.jpg', title: 'Fusión Material', span: 'col-span-1 md:col-span-12 mt-12 md:mt-40 aspect-[21/9]' },
  { src: '648843106_1623950012417747_2278290628706124542_n.jpg', title: 'Resonancia Magnética', span: 'col-span-1 md:col-span-10 md:col-start-2 mt-12 md:mt-24 aspect-[4/5]' },
  // Iconos Pop
  { src: 'hq-james-CjsTrO7r.webp', title: 'James Dean', span: 'col-span-1 md:col-span-8 md:col-start-1 mt-12 md:mt-0 aspect-square' },
  { src: 'hq-amy-BRTriASV.webp', title: 'Amy Winehouse', span: 'col-span-1 md:col-span-4 md:col-start-9 mt-0 md:mt-40 aspect-[4/5]' },
  { src: 'hq-portrait-1-bV-_WHlX.webp', title: 'Retrato I', span: 'col-span-1 md:col-span-5 md:col-start-2 mt-12 md:mt-24 aspect-[3/4]' },
  { src: 'el-gran-dakari-C1tAWAhR.webp', title: 'El Gran Dakari', span: 'col-span-1 md:col-span-6 md:col-start-7 mt-0 md:-mt-20 aspect-square' },
  { src: 'hq-johnny-5ueL8eU0.webp', title: 'Johnny Depp', span: 'col-span-1 md:col-span-12 mt-12 md:mt-40 aspect-[21/9]' },
  { src: 'marilyn-rocks--qPeLHxE.webp', title: 'Marilyn Rocks', span: 'col-span-1 md:col-span-5 md:col-start-1 mt-0 aspect-[4/5]' },
  { src: 'audrey-hepburn-DbIBTtIp.webp', title: 'Audrey Hepburn', span: 'col-span-1 md:col-span-6 md:col-start-7 mt-0 md:mt-32 aspect-[4/5]' },
  { src: 'geisha-MfRtKWdu.webp', title: 'Geisha', span: 'col-span-1 md:col-span-8 md:col-start-3 mt-12 md:mt-24 aspect-[16/9]' },
  { src: 'lagrimas-de-oro-DikHc-Tk.webp', title: 'Lágrimas de Oro', span: 'col-span-1 md:col-span-5 md:col-start-1 mt-0 md:mt-12 aspect-[3/4]' },
  { src: 'love-DA7L_L5F.webp', title: 'Love', span: 'col-span-1 md:col-span-5 md:col-start-8 mt-0 md:-mt-32 aspect-square' },
  { src: 'la-pensadora-CFHSnMA0.webp', title: 'La Pensadora', span: 'col-span-1 md:col-span-10 md:col-start-2 mt-12 md:mt-40 aspect-video' }
];

export default function Home() {
  const [artworks, setArtworks] = useState(baseArtworks);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [takeoverArtwork, setTakeoverArtwork] = useState<{ src: string; title: string } | null>(null);
  const [takeoverCountdown, setTakeoverCountdown] = useState(4);
  const [appMode, setAppMode] = useState<"CAOS" | "ORDEN">("ORDEN");
  const [webGLReady, setWebGLReady] = useState(false);
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    const handleRequest = (e: Event) => {
      setAppMode((e as CustomEvent).detail);
    };
    window.addEventListener('request-dimension-toggle', handleRequest);
    return () => window.removeEventListener('request-dimension-toggle', handleRequest);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('dimension-changed', { detail: appMode }));
  }, [appMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes("local")) {
        setIsLocal(true);
      }
    }
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = requestIdleCallback(() => setWebGLReady(true), { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      const t = setTimeout(() => setWebGLReady(true), 500);
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

    takeoverTimeoutRef.current = setTimeout(() => {
      setTakeoverArtwork(null);
      document.body.style.overflow = '';
      if (takeoverIntervalRef.current) clearInterval(takeoverIntervalRef.current);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (takeoverTimeoutRef.current) clearTimeout(takeoverTimeoutRef.current);
      if (takeoverIntervalRef.current) clearInterval(takeoverIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis();
    let animationId: number;
    function raf(time: number) {
      lenis.raf(time);
      const velocity = lenis.velocity;
      if (typeof window !== 'undefined') {
        (window as any).__scrollVelocity = Math.abs(velocity);
      }
      animationId = requestAnimationFrame(raf);
    }
    animationId = requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(animationId);
    };
  }, []);

  const heroSectionRef = useRef<HTMLDivElement>(null);
  const descenderRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroLightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.8;
      if (threshold > 0) {
        const progress = Math.min(Math.max(scrollY / threshold, 0), 1);
        const easedProgress = Math.pow(progress, 3.5); // Cubic-quartic hybrid
        const translateY = easedProgress * 100;
        
        if (heroSectionRef.current) {
          heroSectionRef.current.style.transform = `translateY(${-translateY}%)`;
        }
        if (descenderRef.current) {
          descenderRef.current.style.opacity = Math.max(0, 0.5 - translateY / 50).toString();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // Calculate cursor position as percentage of viewport
      const xPct = (e.clientX / window.innerWidth) * 100;
      const yPct = (e.clientY / window.innerHeight) * 100;
      
      // The code steps back. We no longer cast artificial colored light over the original art.
      if (heroLightRef.current) {
        heroLightRef.current.style.opacity = '0';
      }
      
      // Calculate heavy 3D parallax tilt (max 2.5 degrees)
      const xTilt = ((e.clientY / window.innerHeight) - 0.5) * -5;
      const yTilt = ((e.clientX / window.innerWidth) - 0.5) * 5;
      
      if (heroImageRef.current) {
        heroImageRef.current.style.transform = `scale(1.04) rotateX(${xTilt}deg) rotateY(${yTilt}deg)`;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Press 'm' or 'M' to switch dimension
      if (e.key.toLowerCase() === 'm') {
        setAppMode((prev) => (prev === 'ORDEN' ? 'CAOS' : 'ORDEN'));
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const updatePrimaryColor = (hex: string) => {
    if (typeof window === 'undefined') return;
    document.documentElement.style.setProperty('--primary', hex);
    document.documentElement.style.setProperty('--color-primary', hex);
    document.documentElement.style.setProperty('--accent', hex);
    
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    
    localStorage.setItem('naroa_primary_color', hex);
    window.dispatchEvent(new CustomEvent('naroa-color-change', { detail: hex }));
  };

  useEffect(() => {
    const selectedColor = '#2B3BE5';
    setTimeout(() => {
      updatePrimaryColor(selectedColor);
    }, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Cap infinite scroll at 3 iterations to prevent DOM memory leaks and layout thrashing
          setArtworks((prev) => prev.length < baseArtworks.length * 3 ? [...prev, ...baseArtworks] : prev);
        }
      },
      { threshold: 0.1, rootMargin: '600px' }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, []);

  const resolveSrc = (src: string) => {
    const url = getImageUrl(src);
    if (isLocal && url.startsWith("/")) {
      return `/assets/${src}`;
    }
    return url;
  };

  return (
    <div className={`flex flex-col min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-black ${appMode === "ORDEN" ? "bg-[#050505]" : ""}`}>
      {appMode === "CAOS" && webGLReady && (
        <>
          <div id="fluid-physics-container" className="fixed inset-0 z-0 pointer-events-auto animate-[fadeIn_4s_ease-out]">
            <SplatPhysicsTester />
          </div>
          <div id="macro-splat-container" className="fixed inset-0 z-10 pointer-events-auto animate-[fadeIn_3s_ease-out] mix-blend-screen">
            <MacroSplatCanvas />
          </div>
        </>
      )}

      {appMode === "ORDEN" && (
        <div id="webgl-container" className="absolute inset-0 z-0 pointer-events-none">
          <WebGLBackground />
        </div>
      )}
      
      <PaintTrail />
      {appMode === "CAOS" && webGLReady && <DepthHUD />}
      {appMode === "CAOS" && webGLReady && <SOTAFX />}
      {appMode === "CAOS" && webGLReady && <Mica />}

      {/* Start Stark Top Navigation Header */}
      <header className="fixed top-0 left-0 w-full px-6 sm:px-12 py-8 flex justify-between items-center z-[210] mix-blend-difference pointer-events-auto select-none text-white animate-[fadeIn_1.5s_ease-out_both]">
        <div className="flex flex-col">
          <span className="font-sans text-[10px] tracking-[0.5em] uppercase font-bold text-[var(--primary)]">
            Naroa Gutiérrez Gil
          </span>
          <span className="font-sans text-[8px] tracking-[0.3em] uppercase opacity-40 mt-1">
            Hiperrealismo // C5-REAL
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Color Palette Switcher */}
          <div className="hidden sm:flex items-center gap-2 bg-black/45 backdrop-blur-md border border-white/5 p-2 rounded-full">
            {[
              { hex: '#2B3BE5', label: 'Cobalto' },
              { hex: '#F59E0B', label: 'Oro' },
              { hex: '#E52B3B', label: 'Crimson' },
              { hex: '#10B981', label: 'Esmeralda' }
            ].map((colorObj) => (
              <button
                key={colorObj.hex}
                onClick={() => updatePrimaryColor(colorObj.hex)}
                style={{ backgroundColor: colorObj.hex }}
                title={colorObj.label}
                className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform cursor-pointer"
              />
            ))}
          </div>

          {/* Dimension Controller */}
          <button 
            onClick={() => setAppMode(prev => prev === 'ORDEN' ? 'CAOS' : 'ORDEN')}
            className="font-mono text-[9px] tracking-widest uppercase bg-black/60 hover:bg-black/90 border border-white/10 hover:border-[var(--primary)] px-4 py-2.5 transition-all cursor-pointer rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.02)]"
          >
            DIMENSIÓN: {appMode}
          </button>
        </div>
      </header>

      {/* Sticky Scroll Wrapper for Monolithic Hero */}
      <div className="relative w-full h-[180vh] bg-[#050505]">
        <section 
          ref={heroSectionRef}
          style={{ transform: 'translateY(0%)' }}
          className="sticky top-0 w-full h-[100svh] flex flex-col justify-center items-center overflow-hidden z-50 bg-[#050505] will-change-transform"
        >
          {/* El Retrato Monumental - Cero Fricción */}
          <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ perspective: '1000px' }}>
            <Image 
              ref={heroImageRef}
              src={resolveSrc('hq-portrait-1-bV-_WHlX.webp')} 
              alt="Naroa Gutiérrez Gil - Impacto Monumental" 
              fill 
              sizes="100vw"
              quality={100}
              priority
              className="object-cover object-center will-change-transform"
              style={{
                transform: 'scale(1.04) rotateX(0deg) rotateY(0deg)',
                transition: 'filter 4s ease-out, brightness 4s ease-out'
              }}
            />
            {/* Veta dorada sutil (Kintsugi) que reacciona a la luz */}
            <div 
              ref={heroLightRef}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.05)_0%,transparent_70%)] mix-blend-color-dodge pointer-events-none transition-all duration-300 ease-out" 
            />
          </div>

          {/* Monumental Hero Typography Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center z-20 text-center pointer-events-none px-4">
            <h1 className="font-serif font-black text-6xl sm:text-[10rem] tracking-tighter text-white uppercase mix-blend-difference select-none leading-none animate-[fadeIn_2.0s_ease-out_both] delay-500">
              N A R O A
            </h1>
            <p className="font-sans text-[9px] tracking-[0.5em] text-white/50 uppercase mt-6 max-w-md select-none mix-blend-difference animate-[fadeIn_2.5s_ease-out_both] delay-[1000ms]">
              Retratos monumentales en pizarra natural
            </p>
          </div>

          {/* Indicador sutil de gravedad - La única señal visual */}
          <div 
            ref={descenderRef}
            style={{ opacity: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 transition-opacity duration-300"
          >
            <span className="text-white/40 font-sans tracking-[0.5em] text-[8px] uppercase">Descender</span>
            <div className="w-px h-16 bg-white/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-white animate-[translateY_2.5s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
            </div>
          </div>
        </section>
      </div>

      {/* ── STATEMENT DEL ARTISTA ── */}
      <section id="statement" className="relative z-10 px-6 sm:px-12 py-56 max-w-6xl mx-auto w-full flex flex-col items-center text-center select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] bg-[var(--primary)] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.05] pointer-events-none" />
        <p className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white uppercase italic leading-tight max-w-4xl">
          "El retrato no copia la vida; <span className="text-[var(--primary)] text-glow">transmuta</span> la materia en presencia."
        </p>
      </section>

      {/* ── LA GALERÍA MONUMENTAL ASIMÉTRICA ── */}
      <section id="galeria" className="relative z-10 px-4 sm:px-12 pb-32 max-w-[1800px] mx-auto w-full">
        <div className="mb-40 text-center flex flex-col items-center">
          <h2 className="text-5xl sm:text-7xl font-serif font-light tracking-wide text-foreground leading-tight max-w-2xl mx-auto uppercase text-glow">La Singularidad</h2>
          <div className="w-px h-16 bg-gradient-to-b from-primary/30 to-transparent mt-12"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-x-24 md:gap-y-32 items-start w-full px-0 md:px-12">
          {artworks.map((artwork, i) => (
            <div 
              key={i} 
              className={`group relative overflow-hidden transition-all duration-1000 bg-[#0A0A0A] rounded-sm ring-1 ring-white/5 shadow-2xl w-full ${artwork.span || "md:col-span-12 aspect-[4/3]"} animate-[fadeIn_0.5s_ease-out_both]`}
              style={{ animationDelay: `${(i % 12) * 100}ms` }}
            >
              <div className="relative w-full h-full">
                {appMode === "CAOS" ? (
                  <KineticArtwork
                    src={resolveSrc(artwork.src)}
                    alt={`Obra de arte: ${artwork.title}`}
                    priority={i < 4}
                    className="transition-transform duration-[2s] ease-[var(--ease-spring)] will-change-transform transform-gpu group-hover:scale-[1.03]"
                    id={artwork.src.split('.')[0].replace(/[^a-zA-Z0-9-]/g, '')}
                    onClick={() => triggerTakeover(artwork)}
                  />
                ) : (
                  <div className="w-full h-full cursor-pointer" onClick={() => triggerTakeover(artwork)}>
                    <Image 
                      src={resolveSrc(artwork.src)} 
                      alt={artwork.title} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 80vw"
                      quality={100}
                      className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03]" 
                      priority={i < 4}
                      loading={i >= 4 ? "lazy" : undefined}
                    />
                  </div>
                )}
              </div>
              
              {/* Stark Hover Info Overlay (Strictly no words on default view) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-8 pointer-events-none">
                <span className="text-[var(--primary)] font-mono text-[9px] tracking-[0.4em] uppercase mb-2">
                  PINTURA S/ PIZARRA
                </span>
                <h3 className="text-white font-serif text-2xl uppercase tracking-wider">
                  {artwork.title}
                </h3>
              </div>
            </div>
          ))}
          <div ref={observerRef} className="col-span-1 md:col-span-12 h-32 w-full flex justify-center items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          </div>
        </div>
      </section>

      {/* ── SEPARADOR VISUAL ── */}
      <div className="relative w-full py-20 flex justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.03)_0%,transparent_50%)] z-0 pointer-events-none" />
        <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent relative z-10"></div>
      </div>

      {/* ── SCROLLYTELLING (Evolución de la Obra) ── */}
      {appMode === "CAOS" && <ScrollyTelling />}

      {/* ── EL TALLER INTERACTIVO ── */}
      {appMode === "CAOS" && <InteractiveStudio />}

      {/* ── GALERÍA TRIDIMENSIONAL ── */}
      {appMode === "CAOS" && <ThreeDCarousel />}

      {/* ── FOOTER VISUAL ── */}
      <Footer />

      <TakeoverModal 
        artwork={takeoverArtwork} 
        countdown={takeoverCountdown} 
        getImageUrl={resolveSrc} 
        onClose={closeTakeover}
      />
    </div>
  );
}
