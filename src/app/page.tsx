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
    const lenis = new Lenis();
    let animationId: number;
    function raf(time: number) {
      lenis.raf(time);
      const velocity = lenis.velocity;
      if (typeof window !== 'undefined') (window as any).__scrollVelocity = Math.abs(velocity);
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.8;
      if (threshold > 0) {
        const progress = Math.min(Math.max(scrollY / threshold, 0), 1);
        const easedProgress = Math.pow(progress, 3.5); 
        const translateY = easedProgress * 100;
        
        if (heroSectionRef.current) heroSectionRef.current.style.transform = `translateY(${-translateY}%)`;
        if (descenderRef.current) descenderRef.current.style.opacity = Math.max(0, 0.5 - translateY / 50).toString();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const xTilt = ((e.clientY / window.innerHeight) - 0.5) * -5;
      const yTilt = ((e.clientX / window.innerWidth) - 0.5) * 5;
      if (heroImageRef.current) heroImageRef.current.style.transform = `scale(1.04) rotateX(${xTilt}deg) rotateY(${yTilt}deg)`;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
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
    <div className="flex flex-col min-h-screen relative overflow-x-hidden selection:bg-transparent selection:text-white bg-[#050505]">
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

      {/* Organic Monolithic Hero - No Headers, No Nav, Pure Typographic Integration */}
      <div className="relative w-full h-[180vh] bg-transparent">
        <section 
          ref={heroSectionRef}
          className="sticky top-0 w-full h-[100svh] flex flex-col justify-center items-center overflow-hidden z-50 bg-transparent will-change-transform"
        >
          {/* Organic Typography Masking - Fluid Reaction to Scroll */}
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center mix-blend-difference pointer-events-none transition-transform duration-100 ease-out" style={{ transform: 'scale(calc(1 + var(--scroll-velocity, 0) * 0.1))' }}>
            <h1 className="text-[16vw] font-serif font-light text-white tracking-tighter uppercase leading-none opacity-90 transition-transform" style={{ transform: 'translateY(calc(var(--scroll-velocity, 0) * 30px))' }}>Naroa</h1>
            <h2 className="text-[16vw] font-serif font-light text-white tracking-tighter uppercase leading-none opacity-90 transition-transform" style={{ transform: 'translateY(calc(var(--scroll-velocity, 0) * -30px))' }}>Gutiérrez</h2>
          </div>

          <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ perspective: '1000px' }}>
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
                transform: 'scale(1.04) rotateX(0deg) rotateY(0deg)',
                transition: 'filter 4s ease-out, brightness 4s ease-out'
              }}
            />
            {/* Pure Organic Kintsugi Dust */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.08)_0%,transparent_80%)] mix-blend-color-dodge pointer-events-none" />
          </div>
        </section>
      </div>

      {/* Organic Floating Canvas Matrix - Zero Borders, Zero Grid Lines, Pure Positioning */}
      <section id="galeria" className="relative z-10 w-full py-40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-32 gap-x-12 px-4 sm:px-12 max-w-[2000px] mx-auto w-full items-center">
          {artworks.map((artwork, i) => (
            <div 
              key={i} 
              className={`group relative overflow-visible transition-all duration-1000 w-full ${artwork.span || "md:col-span-12 aspect-[4/3]"}`}
            >
              <div className="relative w-full h-full hover:z-50 cursor-none">
                <KineticArtwork
                  src={resolveSrc(artwork.src)}
                  alt={`Obra: ${artwork.title}`}
                  priority={i < 4}
                  className="transition-transform duration-[2s] ease-[var(--ease-spring)] will-change-transform transform-gpu group-hover:scale-[1.08] drop-shadow-2xl"
                  id={artwork.src.split('.')[0].replace(/[^a-zA-Z0-9-]/g, '')}
                  onClick={() => triggerTakeover(artwork)}
                />
                
                {/* Organic Title Manifestation */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none mix-blend-difference">
                  <span className="text-white font-serif tracking-[0.3em] text-[2vw] uppercase text-center block whitespace-nowrap drop-shadow-lg">
                    {artwork.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={observerRef} className="col-span-1 md:col-span-12 h-32 w-full flex justify-center items-center">
            {/* Organic Infinite Scroll Trigger - Invisible */}
          </div>
        </div>
      </section>

      {/* Pure Organic Bottom Bleed */}
      <div className="h-[30vh] w-full bg-gradient-to-t from-black to-transparent pointer-events-none relative z-10" />

      <TakeoverModal 
        artwork={takeoverArtwork} 
        countdown={takeoverCountdown} 
        getImageUrl={resolveSrc} 
        onClose={closeTakeover}
      />
    </div>
  );
}