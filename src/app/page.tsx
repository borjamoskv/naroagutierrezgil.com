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
import TakeoverModal from '@/components/TakeoverModal';

const WebGLBackground = dynamic(() => import('@/components/WebGLBackground'), { ssr: false });
const PaintTrail = dynamic(() => import('@/components/PaintTrail'), { ssr: false });
const MacroSplatCanvas = dynamic(() => import('@/components/SplatBenchmarkCanvas'), { ssr: false });
const SplatPhysicsTester = dynamic(() => import('@/components/SplatPhysicsTester'), { ssr: false });
const KineticArtwork = dynamic(() => import('@/components/KineticArtwork'), { ssr: false });

const getImageUrl = (src: string) => {
  if (src.startsWith('http')) return src;
  return `/assets/${src}`;
};

const baseArtworks = [
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
  { src: 'hq-james-CjsTrO7r.webp', title: 'James Dean', span: 'col-span-1 md:col-span-8 md:col-start-1 mt-12 md:mt-0 aspect-square' },
  { src: 'hq-amy-BRTriASV.webp', title: 'Amy Winehouse', span: 'col-span-1 md:col-span-4 md:col-start-9 mt-0 md:mt-40 aspect-[4/5]' },
  { src: 'el-gran-dakari-C1tAWAhR.webp', title: 'El Gran Dakari', span: 'col-span-1 md:col-span-6 md:col-start-7 mt-0 md:-mt-20 aspect-square' },
  { src: 'hq-johnny-5ueL8eU0.webp', title: 'Johnny Depp', span: 'col-span-1 md:col-span-12 mt-12 md:mt-40 aspect-[21/9]' },
  { src: 'marilyn-rocks--qPeLHxE.webp', title: 'Marilyn Rocks', span: 'col-span-1 md:col-span-5 md:col-start-1 mt-0 aspect-[4/5]' },
  { src: 'audrey-hepburn-DbIBTtIp.webp', title: 'Audrey Hepburn', span: 'col-span-1 md:col-span-6 md:col-start-7 mt-0 md:mt-32 aspect-[4/5]' },
  { src: 'geisha-MfRtKWdu.webp', title: 'Geisha', span: 'col-span-1 md:col-span-8 md:col-start-3 mt-12 md:mt-24 aspect-[16/9]' }
];

export default function Home() {
  const [artworks, setArtworks] = useState(baseArtworks);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [takeoverArtwork, setTakeoverArtwork] = useState<{ src: string; title: string } | null>(null);
  const [takeoverCountdown, setTakeoverCountdown] = useState(4);
  const [webGLReady, setWebGLReady] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes("local")) setIsLocal(true);
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
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2,
    });
    
    let animationId: number;
    function raf(time: number) {
      lenis.raf(time);
      const velocity = lenis.velocity;
      if (typeof window !== 'undefined') {
        (window as any).__scrollVelocity = Math.abs(velocity);
        // Inject chromatic aberration variable for typography
        document.documentElement.style.setProperty('--scroll-chromatic', `${Math.min(Math.abs(velocity) * 0.1, 15)}px`);
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
  const heroImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;
    let isHovering = false;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.8;
      if (threshold > 0) {
        const progress = Math.min(Math.max(scrollY / threshold, 0), 1);
        const easedProgress = Math.pow(progress, 3.5); 
        const translateY = easedProgress * 100;
        if (heroSectionRef.current) heroSectionRef.current.style.transform = `translateY(${-translateY}%)`;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      const xTilt = ((e.clientY / window.innerHeight) - 0.5) * -8;
      const yTilt = ((e.clientX / window.innerWidth) - 0.5) * 8;
      if (heroImageRef.current) heroImageRef.current.style.transform = `scale(1.06) rotateX(${xTilt}deg) rotateY(${yTilt}deg)`;
      
      // Check if hovering over an artwork
      const target = e.target as HTMLElement;
      isHovering = !!target.closest('.group');
    };

    const animateCursor = () => {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailX}px, ${trailY}px, 0) scale(${isHovering ? 2.5 : 1})`;
        trailRef.current.style.mixBlendMode = isHovering ? 'difference' : 'normal';
        trailRef.current.style.opacity = isHovering ? '0.8' : '0.4';
      }
      requestAnimationFrame(animateCursor);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    
    handleScroll();
    animateCursor();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setArtworks((prev) => prev.length < baseArtworks.length * 2 ? [...prev, ...baseArtworks] : prev);
        }
      },
      { threshold: 0.1, rootMargin: '600px' }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, []);

  const resolveSrc = (src: string) => {
    const url = getImageUrl(src);
    if (isLocal && url.startsWith("/")) return `/assets/${src}`;
    return url;
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden selection:bg-transparent selection:text-white bg-[#050505] cursor-none">
      
      {/* Custom Mathematical Cursor */}
      <div ref={cursorRef} className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference" />
      <div ref={trailRef} className="fixed top-0 left-0 w-12 h-12 border border-white/40 rounded-full pointer-events-none z-[998] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out" />

      {/* C5-REAL Volumetric Ecosystem */}
      {webGLReady && (
        <>
          <div className="fixed inset-0 z-0 pointer-events-auto animate-[fadeIn_4s_ease-out]">
            <SplatPhysicsTester />
          </div>
          <div className="fixed inset-0 z-10 pointer-events-auto animate-[fadeIn_3s_ease-out] mix-blend-screen">
            <MacroSplatCanvas />
          </div>
          <DepthHUD />
          <SOTAFX />
          <Mica />
        </>
      )}

      <PaintTrail />

      {/* Extreme Typography Hero - Chromatic Aberration & Inertial Parallax */}
      <div className="relative w-full h-[180vh] bg-transparent">
        <section 
          ref={heroSectionRef}
          className="sticky top-0 w-full h-[100svh] flex flex-col justify-center items-center overflow-hidden z-50 bg-transparent will-change-transform"
        >
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center mix-blend-difference pointer-events-none">
            <h1 
              className="text-[18vw] font-serif font-light text-white tracking-tighter uppercase leading-none opacity-90 transition-transform will-change-transform" 
              style={{ 
                transform: 'translateY(calc(var(--scroll-velocity, 0) * 35px)) skewY(calc(var(--scroll-velocity, 0) * 2deg))',
                textShadow: 'calc(var(--scroll-chromatic, 0px) * -1) 0 0 rgba(255,0,0,0.8), calc(var(--scroll-chromatic, 0px) * 1) 0 0 rgba(0,255,255,0.8)'
              }}
            >
              Naroa
            </h1>
            <h2 
              className="text-[18vw] font-serif font-light text-white tracking-tighter uppercase leading-none opacity-90 transition-transform will-change-transform" 
              style={{ 
                transform: 'translateY(calc(var(--scroll-velocity, 0) * -35px)) skewY(calc(var(--scroll-velocity, 0) * -2deg))',
                textShadow: 'calc(var(--scroll-chromatic, 0px) * 1) 0 0 rgba(255,0,0,0.8), calc(var(--scroll-chromatic, 0px) * -1) 0 0 rgba(0,255,255,0.8)'
              }}
            >
              Gutiérrez
            </h2>
          </div>

          <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ perspective: '1200px' }}>
            <Image 
              ref={heroImageRef}
              src={resolveSrc('hq-portrait-1-bV-_WHlX.webp')} 
              alt="Naroa Gutiérrez Gil" 
              fill 
              sizes="100vw"
              quality={100}
              priority
              className="object-cover object-center will-change-transform"
              style={{
                transform: 'scale(1.06) rotateX(0deg) rotateY(0deg)',
                transition: 'filter 3s ease-out, transform 0.1s linear'
              }}
            />
            {/* Liquid Distortion Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.1)_0%,transparent_90%)] mix-blend-color-dodge pointer-events-none" />
          </div>
        </section>
      </div>

      {/* Pure Mathematical Gallery Matrix - 3D Fold-out effect */}
      <section id="galeria" className="relative z-10 w-full py-64">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-48 gap-x-16 px-4 sm:px-16 max-w-[2400px] mx-auto w-full items-center">
          {artworks.map((artwork, i) => (
            <div 
              key={i} 
              className={`group relative overflow-visible transition-all duration-[1200ms] w-full ${artwork.span || "md:col-span-12 aspect-[4/3]"}`}
              style={{
                transform: 'translateY(calc(var(--scroll-velocity, 0) * -10px))',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div className="relative w-full h-full hover:z-50 cursor-none perspective-1000">
                <KineticArtwork
                  src={resolveSrc(artwork.src)}
                  alt={`Obra: ${artwork.title}`}
                  priority={i < 4}
                  className="transition-transform duration-[2s] ease-[var(--ease-spring)] will-change-transform transform-gpu group-hover:scale-[1.12] group-hover:rotate-y-[-5deg] drop-shadow-2xl"
                  id={artwork.src.split('.')[0].replace(/[^a-zA-Z0-9-]/g, '')}
                  onClick={() => triggerTakeover(artwork)}
                />
                
                {/* Organic Title Manifestation - Dissociated Parallax */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none mix-blend-difference group-hover:-translate-y-[60%]">
                  <span className="text-white font-serif tracking-[0.4em] text-[1.5vw] uppercase text-center block whitespace-nowrap drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                    {artwork.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={observerRef} className="col-span-1 md:col-span-12 h-64 w-full flex justify-center items-center" />
        </div>
      </section>

      {/* Infinite Void Footer */}
      <div className="h-[40vh] w-full bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none relative z-10" />

      <TakeoverModal 
        artwork={takeoverArtwork} 
        countdown={takeoverCountdown} 
        getImageUrl={resolveSrc} 
        onClose={closeTakeover}
      />
    </div>
  );
}