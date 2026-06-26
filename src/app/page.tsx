'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import dynamic from 'next/dynamic';

const WebGLBackground = dynamic(() => import('@/components/WebGLBackground'), { ssr: false });
const PaintTrail = dynamic(() => import('@/components/PaintTrail'), { ssr: false });
const MacroSplatCanvas = dynamic(() => import('@/components/SplatBenchmarkCanvas'), { ssr: false });
const SplatPhysicsTester = dynamic(() => import('@/components/SplatPhysicsTester'), { ssr: false });
const KineticArtwork = dynamic(() => import('@/components/KineticArtwork'), { ssr: false });
const ThreeDCarousel = dynamic(() => import('@/components/ThreeDCarousel'), { ssr: false });
const HeroSection = dynamic(() => import('@/components/HeroSection'), { ssr: false });
const PhilosophyStatement = dynamic(() => import('@/components/PhilosophyStatement'), { ssr: false });
const AlcoveSystem = dynamic(() => import('@/components/AlcoveSystem'), { ssr: false });
const LuxuryArtworkViewer = dynamic(() => import('@/components/LuxuryArtworkViewer'), { ssr: false });
const DepthHUD = dynamic(() => import('@/components/DepthHUD'), { ssr: false });
const SOTAFX = dynamic(() => import('@/components/SOTAFX'), { ssr: false });
const Mica = dynamic(() => import('@/components/Mica'), { ssr: false });
const ScrollyTelling = dynamic(() => import('@/components/ScrollyTelling'), { ssr: false });
const TakeoverModal = dynamic(() => import('@/components/TakeoverModal'), { ssr: false });
const ScrollAwareHeader = dynamic(() => import('@/components/ScrollAwareHeader'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });



export default function Home() {
  const [appMode, setAppMode] = useState<"CAOS" | "ORDEN">("ORDEN");
  const [webGLReady, setWebGLReady] = useState(false);
  const [activeAlcove, setActiveAlcove] = useState<'pop' | 'pizarra' | 'poliester' | 'kintsugi' | 'mica' | 'reverso'>('pop');
  const [takeoverArtwork, setTakeoverArtwork] = useState<{ src: string; title: string } | null>(null);
  const [takeoverCountdown, setTakeoverCountdown] = useState(4);
  const [isLocal, setIsLocal] = useState(false);

  const heroImageRef = useRef<HTMLImageElement>(null);
  const descenderRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);

  // Sync Dimension changed custom events
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

  useEffect(() => {
    const lenis = new Lenis();
    let animationId: number;
    function raf(time: number) {
      lenis.raf(time);
      const velocity = lenis.velocity;
      if (typeof window !== 'undefined') {
        (window as unknown as { __scrollVelocity: number }).__scrollVelocity = Math.abs(velocity);
      }
      animationId = requestAnimationFrame(raf);
    }
    animationId = requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Parallax scroll for hero section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.8;
      if (threshold > 0) {
        const progress = Math.min(Math.max(scrollY / threshold, 0), 1);
        const easedProgress = Math.pow(progress, 3.5);
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle tilt and escape keys
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const xTilt = ((e.clientY / window.innerHeight) - 0.5) * -5;
      const yTilt = ((e.clientX / window.innerWidth) - 0.5) * 5;
      if (heroImageRef.current) {
        heroImageRef.current.style.transform = `scale(1.04) rotateX(${xTilt}deg) rotateY(${yTilt}deg)`;
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
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

  const getImageUrl = (src: string) => {
    if (src.startsWith('http')) return src;
    return `/assets/${src}`;
  };

  const resolveSrc = (src: string) => {
    const url = getImageUrl(src);
    if (isLocal && url.startsWith("/")) {
      return `/assets/${src}`;
    }
    return url;
  };

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
    updatePrimaryColor('#2B3BE5');
  }, []);

  // Takeover modal handlers
  const triggerTakeover = (artwork: { src: string; title: string }) => {
    setTakeoverArtwork(artwork);
    setTakeoverCountdown(4);
    document.body.style.overflow = 'hidden';
    const interval = setInterval(() => {
      setTakeoverCountdown(prev => prev - 1);
    }, 1000);
    const timeout = setTimeout(() => {
      setTakeoverArtwork(null);
      document.body.style.overflow = '';
      clearInterval(interval);
    }, 4000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  };

  const closeTakeover = () => {
    setTakeoverArtwork(null);
    document.body.style.overflow = '';
  };

  return (
    <div id="main-content" className={`flex flex-col min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-black ${appMode === "ORDEN" ? "bg-[#050505]" : ""}`}>
      
      {/* Dynamic Backgrounds */}
      {appMode === "CAOS" && webGLReady && (
        <div id="macro-splat-container" className="fixed inset-0 z-0 pointer-events-auto animate-[fadeIn_3s_ease-out]">
          <MacroSplatCanvas />
        </div>
      )}

      {appMode === "ORDEN" && (
        <div id="webgl-container" className="absolute inset-0 z-0 pointer-events-none">
          <WebGLBackground />
        </div>
      )}
      
      <PaintTrail />
      {appMode === "CAOS" && webGLReady && (
        <>
          <DepthHUD />
          <SOTAFX />
          <Mica />
        </>
      )}

      {/* Header & Navigation */}
      <ScrollAwareHeader className="fixed top-0 left-0 w-full px-6 sm:px-12 py-6 flex flex-col justify-between items-center z-[210] mix-blend-difference pointer-events-auto select-none text-white border-b border-white/5 bg-black/20 animate-[fadeIn_1.5s_ease-out_both]">
        <div className="w-full flex justify-between items-center">
          <div className="flex flex-col">
            <span className="font-sans text-[10px] tracking-[0.5em] uppercase font-bold text-[var(--primary)]">
              Naroa Gutiérrez Gil
            </span>
            <span className="font-sans text-[7px] tracking-[0.3em] uppercase opacity-40 mt-1">
              Hiperrealismo Pop & Alquimia Vasca
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Color Palette Switcher */}
            <div className="hidden md:flex items-center gap-2 bg-black/45 backdrop-blur-md border border-white/5 p-2 rounded-full">
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
                  className="w-3.5 h-3.5 rounded-full border border-white/20 hover:scale-125 transition-transform cursor-pointer"
                />
              ))}
            </div>

            <Link
              id="nav-biografia"
              href="/biografia"
              className="font-mono text-[9px] tracking-widest uppercase bg-black/60 hover:bg-black/90 border border-white/10 hover:border-[var(--primary)] px-4 py-2 transition-all cursor-pointer rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            >
              Biografía
            </Link>

            <Link
              id="nav-autodidact"
              href="/autodidact"
              className="font-mono text-[9px] tracking-widest uppercase bg-black/60 hover:bg-black/90 border border-white/10 hover:border-[var(--primary)] px-4 py-2 transition-all cursor-pointer rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            >
              Autodidacta
            </Link>

            <Link
              id="nav-contacto"
              href="/contacto"
              className="font-mono text-[9px] tracking-widest uppercase bg-black/60 hover:bg-black/90 border border-white/10 hover:border-[var(--primary)] px-4 py-2 transition-all cursor-pointer rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            >
              Contacto
            </Link>

            <button 
              id="btn-dimension-toggle"
              onClick={() => setAppMode(prev => prev === 'ORDEN' ? 'CAOS' : 'ORDEN')}
              className="font-mono text-[9px] tracking-widest uppercase bg-black/60 hover:bg-black/90 border border-white/10 hover:border-[var(--primary)] px-4 py-2 transition-all cursor-pointer rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            >
              Dimensión: {appMode}
            </button>
          </div>
        </div>

        {/* Laboratorio HUD Subtitle */}
        <div className="w-full mt-4 pt-3 border-t border-white/5 flex justify-center">
          <span className="font-sans text-[8px] tracking-[0.4em] text-white/50 uppercase">
            Laboratorio de Pintura & Alquimia Lítica • Bilbao 2026
          </span>
        </div>
      </ScrollAwareHeader>

      {/* Hero Section */}
      <HeroSection resolveSrc={resolveSrc} heroSectionRef={heroSectionRef} descenderRef={descenderRef} />

      {/* Philosophy Section */}
      <PhilosophyStatement />

      {/* Mediums & Excavations Tab System */}
      <AlcoveSystem activeAlcove={activeAlcove} setActiveAlcove={setActiveAlcove} resolveSrc={resolveSrc} />

      {/* START: Interactive 3D Canvas Sandbox Details Viewer */}
      <Suspense fallback={<div className="w-full h-96 bg-[#050505]" />}>
        <LuxuryArtworkViewer />
      </Suspense>

      {/* START: 3D Orbital slates gallery */}
      <Suspense fallback={<div className="w-full h-96 bg-[#050505]" />}>
        <ThreeDCarousel />
      </Suspense>

      {/* START: Dynamic Scrollytelling for CAOS mode details */}
      {appMode === "CAOS" && <ScrollyTelling />}

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
