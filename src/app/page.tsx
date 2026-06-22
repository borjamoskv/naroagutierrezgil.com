/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Lenis from 'lenis';
import dynamic from 'next/dynamic';

const WebGLBackground = dynamic(() => import('@/components/WebGLBackground'), { ssr: false });
const PaintTrail = dynamic(() => import('@/components/PaintTrail'), { ssr: false });
const MacroSplatCanvas = dynamic(() => import('@/components/SplatBenchmarkCanvas'), { ssr: false });
const SplatPhysicsTester = dynamic(() => import('@/components/SplatPhysicsTester'), { ssr: false });
const ThreeDCarousel = dynamic(() => import('@/components/ThreeDCarousel'), { ssr: false });
const LuxuryArtworkViewer = dynamic(() => import('@/components/LuxuryArtworkViewer'), { ssr: false });
const DepthHUD = dynamic(() => import('@/components/DepthHUD'), { ssr: false });
const SOTAFX = dynamic(() => import('@/components/SOTAFX'), { ssr: false });
const Mica = dynamic(() => import('@/components/Mica'), { ssr: false });
const ScrollyTelling = dynamic(() => import('@/components/ScrollyTelling'), { ssr: false });
const InteractiveStudio = dynamic(() => import('@/components/InteractiveStudio'), { ssr: false });
const TakeoverModal = dynamic(() => import('@/components/TakeoverModal'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

const baseArtworks = [
  { src: 'hq-james-CjsTrO7r.webp', title: 'James Dean', category: 'pop', desc: 'Pop iconography on slate' },
  { src: 'hq-amy-BRTriASV.webp', title: 'Amy Winehouse', category: 'pop', desc: 'Sinuous expression of voice' },
  { src: 'hq-johnny-5ueL8eU0.webp', title: 'Johnny Depp', category: 'pop', desc: 'Depth of texture & character' },
  { src: 'audrey-hepburn-DbIBTtIp.webp', title: 'Audrey Hepburn', category: 'pop', desc: 'Classic elegance on basalt' },
  { src: 'el-gran-dakari-C1tAWAhR.webp', title: 'El Gran Dakari', category: 'mica', desc: 'Shimmering minerals and glaze' },
  { src: 'geisha-MfRtKWdu.webp', title: 'Geisha', category: 'mica', desc: 'Mixture of gold dust and mica' },
  { src: 'lagrimas-de-oro-DikHc-Tk.webp', title: 'Lágrimas de Oro', category: 'kintsugi', desc: 'Fracture lines sealed in gold' },
  { src: '601340023_1552126202933462_7815927344957967258_n.jpg', title: 'Espejo del Alma I', category: 'pizarra', desc: '100-year-old Basque slate base' },
  { src: '608211438_1562089535270462_2827127275272133326_n.jpg', title: 'Dama de la Pizarra', category: 'pizarra', desc: 'Natural slate relief work' },
  { src: '615438426_1577822580363824_2923463327956560352_n.jpg', title: 'Retrato en Tensión', category: 'pizarra', desc: 'Epoxi resin and slate fusion' },
  { src: '612329591_1571120784367337_8798688892093004057_n.jpg', title: 'Facciones del Silencio', category: 'poliester', desc: 'Translucent polyester sketch' },
  { src: '622453257_1583899099756172_4197872465466826396_n.jpg', title: 'Mirada del Tiempo', category: 'poliester', desc: 'Washed ink chemistry like X-ray' }
];

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
    <div className={`flex flex-col min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-black ${appMode === "ORDEN" ? "bg-[#050505]" : ""}`}>
      
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
      <header className="fixed top-0 left-0 w-full px-6 sm:px-12 py-6 flex flex-col justify-between items-center z-[210] mix-blend-difference pointer-events-auto select-none text-white border-b border-white/5 bg-black/20 backdrop-blur-md animate-[fadeIn_1.5s_ease-out_both]">
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
              href="/biografia"
              className="font-mono text-[9px] tracking-widest uppercase bg-black/60 hover:bg-black/90 border border-white/10 hover:border-[var(--primary)] px-4 py-2 transition-all cursor-pointer rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            >
              Biografía
            </Link>

            <Link
              href="/autodidact"
              className="font-mono text-[9px] tracking-widest uppercase bg-black/60 hover:bg-black/90 border border-white/10 hover:border-[var(--primary)] px-4 py-2 transition-all cursor-pointer rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            >
              Autodidacta
            </Link>

            <button 
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
      </header>

      {/* Hero Section */}
      <div className="relative w-full h-[180vh] bg-[#050505]">
        <section 
          ref={heroSectionRef}
          style={{ transform: 'translateY(0%)' }}
          className="sticky top-0 w-full h-[100svh] flex flex-col justify-center items-center overflow-hidden z-50 bg-[#050505] will-change-transform"
        >
          <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ perspective: '1000px' }}>
            <Image 
              ref={heroImageRef}
              src={resolveSrc('hq-portrait-1-bV-_WHlX.webp')} 
              alt="Naroa Gutiérrez Gil - Impacto Monumental" 
              fill 
              sizes="100vw"
              quality={100}
              priority
              className="object-cover object-center will-change-transform brightness-[0.7] contrast-[1.1]"
              style={{
                transform: 'scale(1.04) rotateX(0deg) rotateY(0deg)',
                transition: 'filter 4s ease-out, brightness 4s ease-out'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" />
          </div>

          {/* Monumental Hero Typography Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center z-20 text-center pointer-events-none px-4">
            <span className="font-mono text-[9px] tracking-[0.6em] text-white/60 uppercase mb-4 animate-[fadeIn_1.5s_ease-out_both]">
              Savoir-Faire Vasco • Artivismo
            </span>
            <h1 className="font-serif font-black text-6xl sm:text-[9rem] tracking-tighter text-white uppercase mix-blend-difference select-none leading-none animate-[fadeIn_2.0s_ease-out_both] delay-500">
              N A R O A
            </h1>
            <p className="font-sans text-[9px] tracking-[0.5em] text-white/50 uppercase mt-8 max-w-md select-none mix-blend-difference animate-[fadeIn_2.5s_ease-out_both] delay-[1000ms]">
              Retratos monumentales sobre pizarra y materiales refractarios
            </p>
          </div>

          {/* Gravity indicator */}
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

      {/* Philosophy Section */}
      <section id="statement" className="relative z-10 px-6 sm:px-12 py-48 max-w-6xl mx-auto w-full flex flex-col items-center text-center select-none">
        <span className="text-[var(--primary)] font-mono text-[9px] tracking-[0.5em] uppercase mb-6">
          Física de la Materia y la Fisura
        </span>
        <p className="text-2xl sm:text-4xl md:text-5xl font-serif font-light tracking-wide text-white leading-relaxed max-w-4xl italic">
          "El lienzo no es un soporte; es la materia misma que <span className="text-[var(--primary)] text-glow font-normal">gobierna la forma</span>. En Naroa, la pizarra centenaria, la mica mineral y el kintsugi se alían en retratos que son calibres de memoria."
        </p>
        <div className="w-16 h-[1px] bg-[#2B3BE5]/30 mt-12" />
      </section>

      {/* Mediums & Excavations Tab System */}
      <section id="alcobas" className="relative z-10 px-6 sm:px-12 py-32 bg-black/60 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
            <div>
              <span className="text-[#2B3BE5] font-mono tracking-[0.4em] text-[9px] uppercase block mb-3">
                Yacimientos del Retrato
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-wide text-white uppercase">
                Materia & Fisura
              </h2>
            </div>
            <p className="max-w-md text-white/40 font-sans text-xs tracking-wider leading-relaxed">
              Explore los 6 pilares constructivos donde la técnica mixta y el soporte de pizarra desafían los límites bidimensionales de la pintura.
            </p>
          </div>

          {/* Alcove tabs */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-16 border-b border-white/5 pb-4">
            {[
              { id: 'pop', num: 'I', label: 'El Retrato Pop' },
              { id: 'pizarra', num: 'II', label: 'Pizarra Centenaria' },
              { id: 'poliester', num: 'III', label: 'Poliéster Translúcido' },
              { id: 'kintsugi', num: 'IV', label: 'Kintsugi Accidental' },
              { id: 'mica', num: 'V', label: 'Mica & Cerámica' },
              { id: 'reverso', num: 'VI', label: 'El Reverso Acústico' }
            ].map(alcove => (
              <button
                key={alcove.id}
                onClick={() => setActiveAlcove(alcove.id as any)}
                className={`flex flex-col items-center py-4 border-b-2 cursor-pointer transition-all duration-300 ${
                  activeAlcove === alcove.id
                    ? 'border-[#2B3BE5] text-white'
                    : 'border-transparent text-white/30 hover:text-white/60'
                }`}
              >
                <span className="font-serif text-xs mb-1 opacity-65">{alcove.num}</span>
                <span className="font-sans text-[9px] tracking-widest uppercase text-center block leading-normal">
                  {alcove.label}
                </span>
              </button>
            ))}
          </div>

          {/* Active Alcove Content Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Description Column */}
            <div className="lg:col-span-5 flex flex-col">
              <span className="text-[#2B3BE5] font-mono text-[9px] tracking-widest uppercase mb-4">
                Arqueología Lítica // Universo {activeAlcove === 'pop' && 'I'}
                {activeAlcove === 'pizarra' && 'II'}
                {activeAlcove === 'poliester' && 'III'}
                {activeAlcove === 'kintsugi' && 'IV'}
                {activeAlcove === 'mica' && 'V'}
                {activeAlcove === 'reverso' && 'VI'}
              </span>
              
              <h3 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-wider mb-6">
                {activeAlcove === 'pop' && 'El Retrato Pop Monumental'}
                {activeAlcove === 'pizarra' && 'La Pizarra de Tejado Vasco'}
                {activeAlcove === 'poliester' && 'El Papel Poliéster Translúcido'}
                {activeAlcove === 'kintsugi' && 'Kintsugi Accidental & Costras'}
                {activeAlcove === 'mica' && 'La Mica Mineral y los Ojos de Cristal'}
                {activeAlcove === 'reverso' && 'El Reverso del Lienzo y la Acústica'}
              </h3>

              <p className="text-white/70 font-sans text-sm leading-relaxed mb-8">
                {activeAlcove === 'pop' && 'La cara no es una similitud física; es una máscara emocional. Rostros icónicos del cine y de la música se plasman sobre un soporte indómito, logrando una confrontación de alta fidelidad entre la saturación del acrílico y la aspereza del basalto.'}
                {activeAlcove === 'pizarra' && 'Material recuperado directamente de derribos de tejados tradicionales en Bilbao. Sometidas a cortes geográficos, sellado con resina epoxi de brillo espejo y rematadas con bordes rotos, las pizarras representan el concepto de refugio, hogar y dureza ancestral.'}
                {activeAlcove === 'poliester' && 'Un laboratorio químico de tintas diluidas con agua de colonia. Los trazos disueltos sobre poliéster translúcido crean siluetas orgánicas flotantes, semejantes a radiografías de huesos o fluidos en tensión lumínica.'}
                {activeAlcove === 'kintsugi' && 'Nacido por un error en pandemia mezclando cola blanca barata y acrílico. La costra del lienzo se resquebraja al secarse. En lugar de descartarlo, la artista raspa la herida y la rellena con barnices de oro, transformando la falla física en una veta de luz.'}
                {activeAlcove === 'mica' && 'Escamas de mica mineral encoladas que reflejan destellos aleatorios según el punto de vista del espectador. Se complementa con las pupilas del retrato, pintadas en capas cerámicas 3D aplicadas con palillo de dientes para lograr un relieve ocular realista.'}
                {activeAlcove === 'reverso' && 'El lienzo físico guarda secretos en su reverso: cartas escritas por el retratado, códigos QR que reproducen el paisaje acústico electrónico compuesto especialmente por el productor Borja Moskv, y el alter ego masculino "Aaron".'}
              </p>

              {/* Technical Specifications list */}
              <div className="border-t border-white/10 pt-6">
                <span className="text-white/30 font-mono text-[9px] tracking-widest uppercase block mb-3">
                  Especificaciones Técnicas
                </span>
                <ul className="grid grid-cols-2 gap-y-4 gap-x-8 font-mono text-[10px] text-white/50">
                  <li>
                    <span className="text-white/30 block mb-1">Materia Prima</span>
                    <span className="text-white">
                      {activeAlcove === 'pop' && 'Acrílico & Basalto'}
                      {activeAlcove === 'pizarra' && 'Pizarra Vasco-Lítica'}
                      {activeAlcove === 'poliester' && 'Tinta y Poliéster'}
                      {activeAlcove === 'kintsugi' && 'Cola, Acrílico & Oro'}
                      {activeAlcove === 'mica' && 'Mica, Barniz de Vidrio'}
                      {activeAlcove === 'reverso' && 'QR & Ledger Criptográfico'}
                    </span>
                  </li>
                  <li>
                    <span className="text-white/30 block mb-1">Fricción Física</span>
                    <span className="text-white">
                      {activeAlcove === 'pop' && 'Grosor 2cm a 4cm'}
                      {activeAlcove === 'pizarra' && 'Corte Rústico Manual'}
                      {activeAlcove === 'poliester' && 'Sin Fricción (Líquido)'}
                      {activeAlcove === 'kintsugi' && 'Fractura Termodinámica'}
                      {activeAlcove === 'mica' && 'Escamas Cristalizadas'}
                      {activeAlcove === 'reverso' && 'Flujo Dual Reverso'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Display Column */}
            <div className="lg:col-span-7 flex justify-center relative">
              <div className="w-full max-w-lg aspect-[4/5] relative bg-neutral-950/80 border border-white/5 rounded-sm overflow-hidden group shadow-2xl">
                {/* Artwork display linked to active tab */}
                <Image
                  src={resolveSrc(
                    activeAlcove === 'pop' ? 'hq-james-CjsTrO7r.webp' :
                    activeAlcove === 'pizarra' ? '601340023_1552126202933462_7815927344957967258_n.jpg' :
                    activeAlcove === 'poliester' ? '612329591_1571120784367337_8798688892093004057_n.jpg' :
                    activeAlcove === 'kintsugi' ? 'lagrimas-de-oro-DikHc-Tk.webp' :
                    activeAlcove === 'mica' ? 'el-gran-dakari-C1tAWAhR.webp' : 'hq-portrait-1-bV-_WHlX.webp'
                  )}
                  alt="Muestra de la técnica de Naroa"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={95}
                  className="object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-105"
                />
                
                {/* Visual frame overlay */}
                <div className="absolute inset-0 border-[12px] border-black/40 pointer-events-none" />
                
                {/* Quick Info tag */}
                <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md px-4 py-2 border border-white/10 text-[9px] font-mono tracking-widest text-white uppercase">
                  [ Muestra Universo {activeAlcove.toUpperCase()} ]
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* START: Interactive 3D Canvas Sandbox Details Viewer */}
      <LuxuryArtworkViewer />

      {/* START: 3D Orbital slates gallery */}
      <ThreeDCarousel />

      {/* START: The co-creation request form (Concierge Customizer) */}
      <InteractiveStudio />

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
