"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Lenis from "lenis";
import HeroFluid from "@/components/HeroFluid";
import InteractiveSlateCanvas from "@/components/InteractiveSlateCanvas";
import ScrollMarquee from "@/components/ScrollMarquee";
import ParallaxHoverCard from "@/components/ParallaxHoverCard";
import MagneticButton from "@/components/MagneticButton";
import AudioSynthesizer from "@/components/AudioSynthesizer";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";

/**
 * Autodidact page - A premium interactive experience inspired by Dennis Snellenberg and Immersive Garden.
 * Explores Naroa Gutiérrez Gil's self-taught journey, raw slate textures, and kintsugi mechanics.
 * Fits Awwwards 2026 guidelines including Web Audio soundscapes, keyboard controls, and motion reduction accessibility.
 * 
 * Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
 */
export default function AutodidactPage() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [entropyRate, setEntropyRate] = useState(12.4);
  const [pointerDown, setPointerDown] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1.1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      if (containerRef.current) {
        const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
        const progress = window.scrollY / (totalHeight || 1);
        setScrollProgress(Math.min(1, Math.max(0, progress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      lenis.destroy();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Track cursor position to update HUD coordinates and calculate dynamic entropy
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Dynamic entropy index based on mouse movement speed and position
      const widthPct = e.clientX / window.innerWidth;
      const heightPct = e.clientY / window.innerHeight;
      const baseEntropy = 10 + (widthPct * 40) + (heightPct * 30);
      setEntropyRate(parseFloat((baseEntropy + Math.random() * 2).toFixed(2)));
    };

    const handlePointerDown = () => setPointerDown(true);
    const handlePointerUp = () => setPointerDown(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  // Scroll to specific chapter element
  const scrollToChapter = (idx: number) => {
    const el = document.getElementById(`chapter-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Keyboard navigation & motion override shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") scrollToChapter(1);
      if (e.key === "2") scrollToChapter(2);
      if (e.key === "3") scrollToChapter(3);
      if (e.key === "4") scrollToChapter(4);
      if (e.key.toLowerCase() === "m") {
        setReducedMotion((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Check prefers-reduced-motion media query on mount
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotion(true);
    }
  }, []);

  // Chapter details for Naroa's journey
  const chapters = [
    {
      src: "/assets/615932964_1577822457030503_2110397705300850911_n.webp",
      title: "La Falla de Pizarra",
      subtitle: "La colisión física con el soporte mineral vasco y la mica translúcida.",
      chapterNumber: "CAPÍTULO 01",
      details: [
        "Soporte: Pizarra de Tejado Vasco",
        "Resistencia: Extrema / Mineral",
        "Modificador: Resina Epoxi Pulida",
        "Ubicación Cantera: Larrabetzu",
        "Fracturas Activas: 4 detectadas"
      ]
    },
    {
      src: "/assets/celia-cruz-cantinflowers-DO-SRKMB.webp",
      title: "Kintsugi Accidental",
      subtitle: "Mezclas de pandemia ('Cantinflowers') que resquebrajan la materia y se sellan con oro.",
      chapterNumber: "CAPÍTULO 02",
      details: [
        "Fórmula: Cola Blanca + Acrílico",
        "Cicatrización: Barniz Cerámico 3D",
        "Veta Símbolo: Kintsugi Pedagógico",
        "Brillos: Mica Mineral Dorada",
        "Ledger Status: Sincronizado"
      ]
    },
    {
      src: "/assets/292544889_3277546379149645_1460977192858455652_n.webp",
      title: "Pedagogía ReCreo",
      subtitle: "Enseñanza libre y curación artística a través de la integración del error.",
      chapterNumber: "CAPÍTULO 03",
      details: [
        "Aulas Activas: Yo Pinto Mucho",
        "Filosofía: Libre de Moldes",
        "Mecanismo: Aceptación del Fallo",
        "Estudiantes Activos: 85+",
        "Impacto Social: CEAR-Euskadi"
      ]
    },
    {
      src: "/assets/divinos-amy-Celol3XJ.webp",
      title: "Colisión Digital",
      subtitle: "La pintura hiperrealista colisiona con el sonido electrónico de Borja Moskv.",
      chapterNumber: "CAPÍTULO 04",
      details: [
        "Fusión: Rework Electrónico",
        "Atmósfera: Industrial Noir 2026",
        "Sync Código: Durable Objects",
        "Ledger Hash: C5-REAL-OK",
        "Sync Core: OMEGA ATMS"
      ]
    }
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#050505] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden relative"
    >
      {/* Immersive Background Film Grain & Interactive Kintsugi Canvas */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HeroFluid />
      </div>
      <InteractiveSlateCanvas disabled={reducedMotion} />

      {/* Floating HUD - Cinematic System Indicators (Immersive Garden style) */}
      <div className="fixed top-0 left-0 w-full z-45 p-6 sm:p-8 flex justify-between items-start pointer-events-none mix-blend-difference select-none">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-primary">
            SYS_ID: NAROA_AUTODIDACT_KERN
          </span>
          <span className="font-mono text-[8px] tracking-[0.2em] text-white/30 uppercase">
            REALITY LEVEL: C5-REAL // CREATOR: borjamoskv
          </span>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <span className="font-mono text-[9px] tracking-[0.3em] text-white/50 uppercase">
            COORDS: X: {mousePos.x} // Y: {mousePos.y}
          </span>
          <span className="font-mono text-[9px] tracking-[0.3em] text-primary uppercase">
            ENTROPY: {entropyRate}% // FRACTURES: ACTIVE
          </span>
        </div>
      </div>

      {/* Vertical Navigation Bar (Side progress tracker) */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-8 items-center pointer-events-auto mix-blend-difference">
        <div className="relative w-[2px] h-32 bg-white/10 overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full bg-primary transition-all duration-300"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
        <span className="font-mono text-[8px] tracking-widest uppercase rotate-90 origin-left translate-y-12 text-white/40">
          SCROLL PROGRESS
        </span>
      </div>

      {/* Page Header Back-Link */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 sm:p-12 mix-blend-difference pointer-events-auto flex justify-between items-center">
        <Link
          href="/"
          className="group flex items-center gap-4 text-white/50 hover:text-white transition-colors duration-500 w-max"
        >
          <div className="w-8 h-[1px] bg-white/30 group-hover:bg-[#2B3BE5] group-hover:w-16 transition-all duration-700" />
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase">Retorno al Laboratorio</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/biografia" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">Biografía</Link>
          <Link href="/contacto" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">Contacto</Link>
        </div>
      </nav>

      {/* MAIN STORYTELLING TRACK */}
      <main className="relative z-20 pt-44 pb-32 max-w-7xl mx-auto px-6 sm:px-12">
        
        {/* HERO INTRO */}
        <ScrollReveal>
        <section className="mb-44 relative">
          <div className="absolute -left-6 sm:-left-12 top-0 w-[2px] h-full bg-gradient-to-b from-[#2B3BE5] via-[#2B3BE5]/10 to-transparent" />
          
          <h1 className="text-[11vw] md:text-[7rem] font-serif font-black leading-[0.85] tracking-tighter uppercase mb-8 drop-shadow-2xl select-none">
            <span className="block overflow-hidden">
              <span className="inline-block animate-[slideUp_1.6s_cubic-bezier(0.16,1,0.3,1)_0.1s_both] text-transparent [-webkit-text-stroke:1px_rgba(234,234,234,0.35)] hover:[-webkit-text-stroke:1px_#2B3BE5] transition-all duration-1000">
                AUTO
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="inline-block animate-[slideUp_1.6s_cubic-bezier(0.16,1,0.3,1)_0.3s_both] text-white text-glow">
                didact
              </span>
            </span>
          </h1>

          <div className="max-w-2xl text-lg sm:text-xl font-light text-white/60 leading-relaxed border-l border-primary/20 pl-8 py-4 mt-12 relative">
            <div className="absolute left-0 top-0 w-[1px] h-12 bg-primary shadow-[0_0_10px_rgba(43,59,229,1)]" />
            <p>
              Naroa Gutiérrez Gil es una <strong className="text-white font-normal">artivista autodidacta</strong>. Su trayectoria rechaza los lienzos tradicionales para excavar la materia: pizarra rescatada de derribos y mica mineral translúcida. Cada pieza es una batalla física con el mineral.
            </p>
            <p className="mt-4 text-sm text-white/40 leading-relaxed">
              *Nota: Pulsa y arrastra el cursor en cualquier parte de la pantalla para grabar grietas de oro (kintsugi) y modular el sintetizador de sonido en tiempo real.
            </p>
          </div>
        </section>
        </ScrollReveal>

        {/* MARQUEE RUNNING BANNER (Dennis Snellenberg Style) */}
        <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] my-32 py-8 bg-[#0F0F0F] border-y border-white/5 overflow-hidden">
          <ScrollMarquee
            texts={[
              "AUTODIDACTA RADICAL",
              "MATERIA INESTABLE",
              "KINTSUGI ACCIDENTAL",
              "PIZARRA VACA DE DERRIBO",
              "EL ERROR COMO CURACIÓN",
              "COLISIÓN ELECTRÓNICA // BORJA MOSKV"
            ]}
            baseSpeed={reducedMotion ? 0.0 : 2.0}
            textClassName="font-serif text-5xl md:text-8xl tracking-tight text-white/95 uppercase italic"
          />
        </section>

        {/* INTRODUCTORY STATEMENTS */}
        <section className="mb-44 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="w-[1px] h-16 bg-gradient-to-b from-primary/60 to-transparent mb-12" />
          <h2 className="text-2xl sm:text-4xl font-serif italic text-white leading-relaxed">
            "El soporte no es un recipiente pasivo. Es un adversario físico. Mi pintura emerge de la fricción con la piedra y el relieve mineral."
          </h2>
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-primary/60 to-transparent mt-12" />
        </section>

        {/* 3D PARALLAX CARDS GRID (Dennis Snellenberg + Immersive Garden layout) */}
        <section className="mb-56 grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
          {chapters.map((chapter, index) => (
            <ScrollReveal delay={index * 0.15} key={index}>
              <div id={`chapter-${index + 1}`} className="scroll-mt-32">
                <ParallaxHoverCard
                  src={chapter.src}
                  title={chapter.title}
                  subtitle={chapter.subtitle}
                  chapterNumber={chapter.chapterNumber}
                  details={chapter.details}
                  className={index % 2 === 1 ? "md:translate-y-20" : ""}
                />
              </div>
            </ScrollReveal>
          ))}
        </section>

        {/* THE PEDAGOGY OF ERROR DETAIL SECTION */}
        <ScrollReveal>
        <section className="mb-44 py-16 px-8 sm:px-16 bg-[#0A0A0A] border border-white/5 rounded-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-3xl space-y-8 relative z-10">
            <span className="font-mono text-[9px] tracking-[0.4em] text-primary uppercase">
              METODOLOGÍA DE SANACIÓN // EL RECREO
            </span>
            <h3 className="font-serif text-4xl sm:text-5xl uppercase tracking-wide text-white">
              Pedagogía del Caos & Kintsugi Pedagógico
            </h3>
            <p className="text-white/60 font-light text-lg leading-relaxed">
              En sus talleres libres (<em className="text-white font-normal">"El ReCreo"</em>, <em className="text-white font-normal">"Yo Pinto Mucho"</em>), Naroa enseña sin modelos preestablecidos. El error se abraza de forma terapéutica y reparadora: las imperfecciones en el trazo o la mezcla fallida no se desechan, sino que se destacan, se raspan y se sellan con mica mineral y brillo, convirtiendo la cicatriz del lienzo en el centro luminoso de la obra.
            </p>
            <p className="text-white/40 text-sm leading-relaxed border-l-2 border-primary pl-6">
              "No buscamos copiar un modelo ideal; buscamos liberar la expresión reprimida. La pizarra rota es el soporte de una resiliencia tangible."
            </p>
          </div>
        </section>
        </ScrollReveal>

        {/* BOTTOM CTA: MAGNETIC NAVIGATION BUTTON (Dennis Snellenberg Style) */}
        <section className="flex flex-col items-center justify-center py-20 text-center">
          <h4 className="font-serif text-3xl sm:text-4xl text-white uppercase tracking-wider mb-12">
            ¿Quieres explorar la física de la pizarra?
          </h4>
          
          <div className="flex flex-wrap gap-8 justify-center items-center">
            {/* Magnetic Button back to homepage */}
            <Link href="/" passHref legacyBehavior>
              <MagneticButton
                range={70}
                strength={0.3}
                className="px-10 py-6 bg-primary hover:bg-[#1E2BC5] text-white font-mono text-xs tracking-[0.3em] uppercase rounded-full shadow-[0_0_30px_rgba(43,59,229,0.3)] transition-all"
              >
                Volver a la Galería
              </MagneticButton>
            </Link>

            {/* Link to physics test site */}
            <Link href="/test-physics" passHref legacyBehavior>
              <MagneticButton
                range={70}
                strength={0.3}
                className="px-10 py-6 bg-transparent hover:bg-white/5 border border-white/10 text-white font-mono text-xs tracking-[0.3em] uppercase rounded-full transition-all"
              >
                Probar WebGPU Física
              </MagneticButton>
            </Link>
          </div>
        </section>

      </main>

      {/* Dynamic Soundscape Synthesizer */}
      <AudioSynthesizer
        pointerDown={pointerDown}
        pointerX={mousePos.x}
        pointerY={mousePos.y}
      />

      {/* Accessible Control HUD (Bottom Left) */}
      <div className="fixed bottom-6 left-6 z-50 flex gap-4 pointer-events-auto mix-blend-difference select-none text-[9px] font-mono tracking-widest text-white/50">
        <button
          onClick={() => setReducedMotion((p) => !p)}
          className="hover:text-primary transition-colors cursor-pointer"
          title="Alternar animaciones"
        >
          [M] MOVIMIENTO: {reducedMotion ? "REDUCIDO" : "NORMAL"}
        </button>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline text-white/30">TECLAS [1, 2, 3, 4] NAVEGAN CAPÍTULOS</span>
      </div>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}
