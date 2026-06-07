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

const WebGLBackground = dynamic(() => import('@/components/WebGLBackground'), { ssr: false });
const PaintTrail = dynamic(() => import('@/components/PaintTrail'), { ssr: false });

const getImageUrl = (src: string) => {
  if (src.startsWith('http')) {
    return src;
  }
  if (
    src.endsWith('.jpg') || 
    src.endsWith('.png') || 
    src.endsWith('.jpeg') || 
    src === 'amy.webp' || 
    src === 'james.webp' || 
    src === 'lagrimas.webp'
  ) {
    return `/assets/${src}`;
  }
  return `https://naroa.online/assets/${src}`;
};

const baseArtworks = [
  // Local Original Facebook/HQ Scans
  { src: 'Naroa x16.jpeg', title: 'Alquimia en Pizarra (Colección)', span: 'md:col-span-10 md:col-start-2 row-span-2' },
  { src: '601340023_1552126202933462_7815927344957967258_n.jpg', title: 'Espejo del Alma I', span: 'md:col-span-8 md:col-start-3 row-span-2' },
  { src: '608211438_1562089535270462_2827127275272133326_n.jpg', title: 'Dama de la Pizarra', span: 'md:col-span-6 md:col-start-7 row-span-2' },
  { src: '612329591_1571120784367337_8798688892093004057_n.jpg', title: 'Facciones del Silencio', span: 'md:col-span-6 md:col-start-1 row-span-1' },
  { src: '615438426_1577822580363824_2923463327956560352_n.jpg', title: 'Retrato en Tensión', span: 'md:col-span-5 md:col-start-2 row-span-1' },
  { src: '615955827_1577822687030480_2386611372471959463_n.jpg', title: 'Materia y Silencio', span: 'md:col-span-10 md:col-start-2 row-span-2' },
  { src: '616115287_1577822747030474_1432330062205548806_n.jpg', title: 'Retrato de Fama I', span: 'md:col-span-4 md:col-start-8 row-span-1' },
  { src: '616822144_1580323063447109_589182952237233174_n.jpg', title: 'Retrato del Viento', span: 'md:col-span-6 md:col-start-1 row-span-1' },
  { src: '622453257_1583899099756172_4197872465466826396_n.jpg', title: 'Mirada del Tiempo I', span: 'md:col-span-8 md:col-start-3 row-span-2' },
  // Iconos Pop
  { src: 'hq-james-CjsTrO7r.webp', title: 'James Dean', span: 'md:col-span-12 row-span-2' },
  { src: 'hq-amy-BRTriASV.webp', title: 'Amy Winehouse', span: 'md:col-span-5 md:col-start-1 row-span-1' },
  { src: 'hq-portrait-1-bV-_WHlX.webp', title: 'Retrato I', span: 'md:col-span-5 md:col-start-8 row-span-1' },
  { src: 'el-gran-dakari-C1tAWAhR.webp', title: 'El Gran Dakari', span: 'md:col-span-8 md:col-start-3 row-span-2' },
  { src: 'hq-johnny-5ueL8eU0.webp', title: 'Johnny Depp', span: 'md:col-span-6 md:col-start-1 row-span-1' },
  { src: 'marilyn-rocks--qPeLHxE.webp', title: 'Marilyn Rocks', span: 'md:col-span-6 md:col-start-7 row-span-2' },
  { src: 'audrey-hepburn-DbIBTtIp.webp', title: 'Audrey Hepburn', span: 'md:col-span-8 md:col-start-3 row-span-2' },
  { src: 'geisha-MfRtKWdu.webp', title: 'Geisha', span: 'md:col-span-5 md:col-start-2 row-span-1' },
  { src: 'lagrimas-de-oro-DikHc-Tk.webp', title: 'Lágrimas de Oro', span: 'md:col-span-10 md:col-start-2 row-span-2' },
  { src: 'love-DA7L_L5F.webp', title: 'Love', span: 'md:col-span-6 md:col-start-4 row-span-1' },
  { src: 'la-pensadora-CFHSnMA0.webp', title: 'La Pensadora', span: 'md:col-span-8 md:col-start-3 row-span-2' }
];

interface ParallaxItemProps {
  src: string;
  alt: string;
  i: number;
  span: string;
}

function ParallaxItem({ src, alt, i, span }: ParallaxItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const itemCenter = rect.top + rect.height / 2;
      const viewCenter = windowHeight / 2;
      const offset = (itemCenter - viewCenter) / (windowHeight + rect.height);
      setTranslateY(offset * -80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`${span} group relative overflow-hidden bg-[#0A0A0A] rounded-sm ring-1 ring-white/5 shadow-2xl hover:shadow-[0_0_80px_rgba(43,59,229,0.15)] transition-shadow duration-1000`}
    >
      <div 
        className="absolute inset-0 w-full h-[120%] -top-[10%] transition-transform duration-75 ease-out"
        style={{ transform: `translate3d(0, ${translateY}px, 0)` }}
      >
        <Image 
          src={src} 
          alt={alt} 
          fill 
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={100}
          className="w-full h-full object-cover transition-all duration-[3.5s] ease-out grayscale-[0.2] contrast-[1.1] brightness-90 group-hover:grayscale-0 group-hover:scale-[1.04]" 
          loading={i < 4 ? "eager" : "lazy"}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none flex flex-col justify-end p-8 sm:p-12 z-20">
        <h3 className="text-white font-serif text-3xl sm:text-5xl font-light tracking-wide mix-blend-difference translate-y-8 group-hover:translate-y-0 transition-transform duration-700">{alt}</h3>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(43,59,229,0.15)_0%,transparent_50%)] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </div>
  );
}

export default function Home() {
  const [artworks, setArtworks] = useState(baseArtworks);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lenis = new Lenis();
    let animationId: number;
    function raf(time: number) {
      lenis.raf(time);
      const velocity = lenis.velocity;
      const direction = lenis.direction;
      document.documentElement.style.setProperty('--scroll-velocity', Math.abs(velocity).toString());
      document.documentElement.style.setProperty('--scroll-direction', direction.toString());
      animationId = requestAnimationFrame(raf);
    }
    animationId = requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    const palettes = ['#2B3BE5', '#C6A87C', '#10B981', '#D9383A', '#D97706', '#8B5CF6', '#06B6D4'];
    let selectedColor = localStorage.getItem('naroa_primary_color');
    if (!selectedColor) {
      selectedColor = palettes[Math.floor(Math.random() * palettes.length)];
      localStorage.setItem('naroa_primary_color', selectedColor);
    }
    document.documentElement.style.setProperty('--primary', selectedColor);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setArtworks((prev) => [...prev, ...baseArtworks]);
        }
      },
      { threshold: 0.1, rootMargin: '600px' }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-black">
      <div id="webgl-container" className="absolute inset-0 z-0 pointer-events-none">
        <WebGLBackground />
      </div>
      <PaintTrail />
      <DepthHUD />
      <SOTAFX />
      <Mica />
      <section className="relative w-full h-screen flex flex-col justify-between overflow-hidden px-6 sm:px-12 py-12">
        <HeroFluid />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(43,59,229,0.15)_0%,transparent_50%)] z-0 pointer-events-none mix-blend-color-dodge" />
        <div className="relative z-10 w-full flex justify-between items-start animate-[fadeIn_2s_ease-out]">
          <span className="text-foreground/40 font-sans tracking-[0.2em] text-[9px] uppercase">Acrílico sobre pizarra</span>
          <span className="text-foreground/40 font-sans tracking-[0.2em] text-[9px] uppercase">Bilbao</span>
        </div>
        <div className="relative z-10 flex flex-col items-start w-full max-w-[1800px] mx-auto mt-20 mb-auto min-h-[50vh] justify-center">
          <h1 className="relative flex flex-col w-full text-[15vw] leading-[0.75] font-serif font-light tracking-tighter uppercase select-none">
            <span className="flex overflow-hidden z-10">
              <span className="animate-[slideUp_1.5s_cubic-bezier(0.16,1,0.3,1)_0.1s_both] text-transparent [-webkit-text-stroke:1px_var(--color-foreground)] sm:[-webkit-text-stroke:2px_var(--color-foreground)] opacity-50 mix-blend-difference chromatic-text">Naroa</span>
            </span>
            <span className="absolute top-[20%] left-[5%] sm:left-[12%] z-30 pointer-events-none w-full">
              <span className="inline-block animate-[slideUp_2s_cubic-bezier(0.16,1,0.3,1)_0.4s_both] text-primary font-hand normal-case tracking-normal text-[26vw] sm:text-[22vw] -rotate-6 drop-shadow-[0_20px_50px_rgba(43,59,229,0.5)] mix-blend-screen chromatic-text">Gutiérrez</span>
            </span>
            <span className="flex overflow-hidden self-end mr-[2vw] sm:mr-[8vw] z-20 mt-[2vw]">
              <span className="animate-[slideUp_1.5s_cubic-bezier(0.16,1,0.3,1)_0.2s_both] text-foreground mix-blend-difference chromatic-text">Gil</span>
            </span>
          </h1>
        </div>
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-end items-end gap-12 mt-auto max-w-[1800px] mx-auto animate-[fadeIn_3s_ease-out_1s_both]">
          <a href="/biografia" aria-label="Explorar la biografía" className="group flex items-center gap-6 text-foreground/30 hover:text-primary transition-colors duration-700 cursor-pointer">
            <span className="uppercase font-sans tracking-[0.4em] text-[9px] font-medium rotate-180 [writing-mode:vertical-rl]">Biografía</span>
            <div className="w-[1px] h-32 bg-foreground/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-primary animate-[translateY_2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
            </div>
          </a>
          <a href="#galeria" aria-label="Descender a la galería" className="group flex items-center gap-6 text-foreground/30 hover:text-primary transition-colors duration-700 cursor-pointer">
            <span className="uppercase font-sans tracking-[0.4em] text-[9px] font-medium rotate-180 [writing-mode:vertical-rl]">Descender</span>
            <div className="w-[1px] h-32 bg-foreground/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-primary animate-[translateY_2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
            </div>
          </a>
        </div>
      </section>
      <section id="galeria" className="relative z-10 px-4 sm:px-12 py-32 max-w-[1800px] mx-auto w-full">
        <div className="mb-40 text-center flex flex-col items-center">
          <h2 className="text-5xl sm:text-7xl font-serif font-light tracking-wide text-foreground leading-tight max-w-2xl mx-auto uppercase">Obras</h2>
          <div className="w-px h-16 bg-gradient-to-b from-primary/30 to-transparent mt-12"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-x-12 w-full px-4 sm:px-12 max-w-[100vw]">
          {artworks.map((artwork, i) => (
            <ParallaxItem 
              src={getImageUrl(artwork.src)} 
              alt={artwork.title} 
              i={i} 
              key={i} 
              span={artwork.span}
            />
          ))}
          <div ref={observerRef} className="col-span-12 h-20 w-full flex justify-center items-center">
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
      <ScrollyTelling />

      {/* ── EL TALLER INTERACTIVO ── */}
      <InteractiveStudio />

      {/* ── FOOTER VISUAL ── */}
      <footer className="relative pt-40 pb-20 overflow-hidden bg-[#0A0A0A] border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(43,59,229,0.08)_0%,transparent_60%)] z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <a 
            href="mailto:naroa@naroa.eu" 
            aria-label="Enviar correo a Naroa"
            className="text-4xl sm:text-6xl md:text-[7rem] font-serif font-light tracking-tighter text-foreground/70 hover:text-primary transition-colors duration-1000 mb-12 block hover:tracking-normal"
          >
            naroa@naroa.eu
          </a>
          
          <a href="https://naroa.online" aria-label="Acceder al Laboratorio Kinético SOTA" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 text-primary/50 hover:text-primary transition-colors duration-500 mb-20 px-8 py-3 border border-primary/20 hover:border-primary/50 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-sans text-[9px] tracking-[0.4em] uppercase">Acceder al Laboratorio Kinético</span>
          </a>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-3xl pt-12 border-t border-white/5 text-foreground/30 font-sans text-xs tracking-widest uppercase">
            <span>© 2026 Naroa Gutiérrez Gil · Creado por <a href="https://www.borjamoskv.com" aria-label="Web de Borja Moskv" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-500">Borja Moskv</a></span>
            <span className="mt-4 sm:mt-0">Bilbao, Spain</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
