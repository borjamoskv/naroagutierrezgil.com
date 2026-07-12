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
const WordPressPortal = dynamic(() => import('@/components/WordPressPortal'), { ssr: false });
const WordPressFeedClient = dynamic(() => import('@/components/WordPressFeedClient'), { ssr: false });

const baseArtworks = [
  { src: 'james-new.webp', title: 'James Dean', category: 'pop', desc: 'Pop iconography on slate' },
  { src: 'amy-new.webp', title: 'Amy Winehouse', category: 'pop', desc: 'Sinuous expression of voice' },
  { src: 'johnny-new.webp', title: 'Johnny Depp', category: 'pop', desc: 'Depth of texture & character' },
  { src: 'audrey-hepburn-DbIBTtIp.webp', title: 'Audrey Hepburn', category: 'pop', desc: 'Classic elegance on basalt' },
  { src: 'el-gran-dakari-C1tAWAhR.webp', title: 'El Gran Dakari', category: 'mica', desc: 'Shimmering minerals and glaze' },
  { src: 'geisha-MfRtKWdu.webp', title: 'Geisha', category: 'mica', desc: 'Mixture of gold dust and mica' },
  { src: 'lagrimas-de-oro-DikHc-Tk.webp', title: 'Lágrimas de Oro', category: 'kintsugi', desc: 'Fracture lines sealed in gold' },
  { src: '601340023_1552126202933462_7815927344957967258_n.webp', title: 'Espejo del Alma I', category: 'pizarra', desc: '100-year-old Basque slate base' },
  { src: '608211438_1562089535270462_2827127275272133326_n.webp', title: 'Dama de la Pizarra', category: 'pizarra', desc: 'Natural slate relief work' },
  { src: '615438426_1577822580363824_2923463327956560352_n.webp', title: 'Retrato en Tensión', category: 'pizarra', desc: 'Epoxi resin and slate fusion' },
  { src: '612329591_1571120784367337_8798688892093004057_n.webp', title: 'Facciones del Silencio', category: 'poliester', desc: 'Translucent polyester sketch' },
  { src: '622453257_1583899099756172_4197872465466826396_n.webp', title: 'Mirada del Tiempo', category: 'poliester', desc: 'Washed ink chemistry like X-ray' }
];

export default function Home() {
  const [appMode, setAppMode] = useState<"CAOS" | "ORDEN">("ORDEN");
  const [webGLReady, setWebGLReady] = useState(false);
  const [activeAlcove, setActiveAlcove] = useState<'pop' | 'pizarra' | 'poliester' | 'kintsugi' | 'mica' | 'reverso'>('pop');
  const [takeoverArtwork, setTakeoverArtwork] = useState<{ src: string; title: string; category?: string; desc?: string } | null>(null);
  const [isPersistentTakeover, setIsPersistentTakeover] = useState(false);
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
  const triggerTakeover = (artwork: { src: string; title: string; category?: string; desc?: string }) => {
    setTakeoverArtwork(artwork);
    setTakeoverCountdown(4);
    setIsPersistentTakeover(false);
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

  const openFullscreenArtwork = (artwork: { src: string; title: string; category?: string; desc?: string }) => {
    setTakeoverArtwork(artwork);
    setIsPersistentTakeover(true);
    document.body.style.overflow = 'hidden';
  };

  const closeTakeover = () => {
    setTakeoverArtwork(null);
    setIsPersistentTakeover(false);
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
              id="nav-blog"
              href="/blog"
              className="font-mono text-[9px] tracking-widest uppercase bg-black/60 hover:bg-black/90 border border-white/10 hover:border-[var(--primary)] px-4 py-2 transition-all cursor-pointer rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            >
              Bitácora
            </Link>

            <Link
              id="nav-contacto"
              href="/contacto"
              className="font-mono text-[9px] tracking-widest uppercase bg-black/60 hover:bg-black/90 border border-white/10 hover:border-[var(--primary)] px-4 py-2 transition-all cursor-pointer rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            >
              Contacto
            </Link>

            <a
              id="nav-laboratorio"
              href="https://naroa.online"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[9px] tracking-widest uppercase bg-black/60 hover:bg-black/90 border border-white/10 hover:border-[var(--primary)] px-4 py-2 transition-all cursor-pointer rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.02)] text-primary"
            >
              Laboratorio 3D
            </a>

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
      <AlcoveSystem activeAlcove={activeAlcove} setActiveAlcove={setActiveAlcove} resolveSrc={resolveSrc} onExpand={openFullscreenArtwork} />

      {/* START: Interactive 3D Canvas Sandbox Details Viewer */}
      <Suspense fallback={<div className="w-full h-96 bg-[#050505]" />}>
        <LuxuryArtworkViewer onExpand={openFullscreenArtwork} />
      </Suspense>

      {/* START: 3D Orbital slates gallery */}
      <Suspense fallback={<div className="w-full h-96 bg-[#050505]" />}>
        <ThreeDCarousel onExpand={openFullscreenArtwork} />
      </Suspense>

      {/* START: Dynamic Scrollytelling for CAOS mode details */}
      {appMode === "CAOS" && <ScrollyTelling />}

      <WordPressPortal />
      <WordPressFeedClient />
      <Footer />

      <TakeoverModal 
        artwork={takeoverArtwork} 
        countdown={isPersistentTakeover ? null : takeoverCountdown} 
        isPersistent={isPersistentTakeover}
        getImageUrl={resolveSrc} 
        onClose={closeTakeover}
      />
    </div>
  );
}
