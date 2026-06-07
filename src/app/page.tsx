"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Lenis from "lenis";
import dynamic from "next/dynamic";
import DepthHUD from "@/components/DepthHUD";
import SOTAFX from "@/components/SOTAFX";
import Mica from "@/components/Mica";
import HeroFluid from "@/components/HeroFluid";
import ScrollyTelling from "@/components/ScrollyTelling";
import InteractiveStudio from "@/components/InteractiveStudio";

const WebGLBackground = dynamic(() => import("@/components/WebGLBackground"), {
  ssr: false,
});
const PaintTrail = dynamic(() => import("@/components/PaintTrail"), {
  ssr: false,
});
const SplatPhysicsTester = dynamic(() => import("@/components/SplatPhysicsTester"), {
  ssr: false,
});

const getImageUrl = (src: string) => {
  if (src.startsWith("http")) {
    return src;
  }
  // Cloudflare Pages native Image Resizing (C5-REAL LCP Burst)
  if (
    src.endsWith(".jpg") ||
    src.endsWith(".png") ||
    src.endsWith(".jpeg") ||
    src === "amy.webp" ||
    src === "james.webp" ||
    src === "lagrimas.webp"
  ) {
    return `/cdn-cgi/image/format=auto,quality=80/assets/${src}`;
  }
  return `https://naroa.online/cdn-cgi/image/format=auto,quality=80/assets/${src}`;
};

const baseArtworks = [
  // Local Original Facebook/HQ Scans
  {
    src: "Naroa x16.jpeg",
    title: "Alquimia en Pizarra",
    span: "col-span-1 md:col-span-10 md:col-start-2 md:row-span-2 aspect-[4/5]",
  },
  {
    src: "601340023_1552126202933462_7815927344957967258_n.jpg",
    title: "Espejo del Alma I",
    span: "col-span-1 md:col-span-5 md:col-start-1 mt-0 md:mt-32 aspect-[3/4]",
  },
  {
    src: "608211438_1562089535270462_2827127275272133326_n.jpg",
    title: "Dama de la Pizarra",
    span: "col-span-1 md:col-span-6 md:col-start-7 mt-0 md:-mt-20 aspect-square",
  },
  {
    src: "612329591_1571120784367337_8798688892093004057_n.jpg",
    title: "Facciones del Silencio",
    span: "col-span-1 md:col-span-7 md:col-start-3 mt-12 md:mt-40 aspect-[16/9]",
  },
  {
    src: "615438426_1577822580363824_2923463327956560352_n.jpg",
    title: "Retrato en Tensión",
    span: "col-span-1 md:col-span-4 md:col-start-1 mt-0 md:mt-24 aspect-[4/5]",
  },
  {
    src: "615443765_1577822577030491_9008867371114744175_n.jpg",
    title: "Estudio de Luz",
    span: "col-span-1 md:col-span-5 md:col-start-8 mt-0 md:-mt-48 aspect-[3/4]",
  },
  {
    src: "615955827_1577822687030480_2386611372471959463_n.jpg",
    title: "Materia y Silencio",
    span: "col-span-1 md:col-span-12 md:col-start-1 mt-12 md:mt-32 aspect-[21/9]",
  },
  {
    src: "616115287_1577822747030474_1432330062205548806_n.jpg",
    title: "Retrato de Fama I",
    span: "col-span-1 md:col-span-6 md:col-start-2 mt-0 aspect-square",
  },
  {
    src: "616822144_1580323063447109_589182952237233174_n.jpg",
    title: "Retrato del Viento",
    span: "col-span-1 md:col-span-4 md:col-start-9 mt-0 md:mt-40 aspect-[4/5]",
  },
  {
    src: "622453257_1583899099756172_4197872465466826396_n.jpg",
    title: "Mirada del Tiempo",
    span: "col-span-1 md:col-span-8 md:col-start-3 mt-12 md:mt-24 aspect-[16/10]",
  },
  {
    src: "292544889_3277546379149645_1460977192858455652_n.jpg",
    title: "Proceso I",
    span: "col-span-1 md:col-span-3 md:col-start-1 mt-0 md:mt-12 aspect-[3/4]",
  },
  {
    src: "594972277_1543116283834454_8672784625256696657_n.jpg",
    title: "Proceso II",
    span: "col-span-1 md:col-span-3 md:col-start-5 mt-0 md:-mt-20 aspect-square",
  },
  {
    src: "600258291_1552125946266821_6847049145049928090_n.jpg",
    title: "Proceso III",
    span: "col-span-1 md:col-span-3 md:col-start-9 mt-0 md:mt-32 aspect-[4/5]",
  },
  {
    src: "615932964_1577822457030503_2110397705300850911_n.jpg",
    title: "Textura Epoxi",
    span: "col-span-1 md:col-span-10 md:col-start-2 mt-12 md:mt-32 aspect-video",
  },
  {
    src: "616035859_1577822453697170_3937842745320602184_n.jpg",
    title: "Corte Mineral",
    span: "col-span-1 md:col-span-6 md:col-start-1 mt-0 md:mt-20 aspect-square",
  },
  {
    src: "616198291_1577822413697174_3337151405885426240_n.jpg",
    title: "Superficie Táctil",
    span: "col-span-1 md:col-span-5 md:col-start-8 mt-0 md:-mt-10 aspect-[3/4]",
  },
  {
    src: "616994481_1577822437030505_8337096648607967605_n.jpg",
    title: "Fusión Material",
    span: "col-span-1 md:col-span-12 mt-12 md:mt-40 aspect-[21/9]",
  },
  // Iconos Pop
  {
    src: "hq-james-CjsTrO7r.webp",
    title: "James Dean",
    span: "col-span-1 md:col-span-8 md:col-start-1 mt-12 md:mt-0 aspect-square",
  },
  {
    src: "hq-amy-BRTriASV.webp",
    title: "Amy Winehouse",
    span: "col-span-1 md:col-span-4 md:col-start-9 mt-0 md:mt-40 aspect-[4/5]",
  },
  {
    src: "hq-portrait-1-bV-_WHlX.webp",
    title: "Retrato I",
    span: "col-span-1 md:col-span-5 md:col-start-2 mt-12 md:mt-24 aspect-[3/4]",
  },
  {
    src: "el-gran-dakari-C1tAWAhR.webp",
    title: "El Gran Dakari",
    span: "col-span-1 md:col-span-6 md:col-start-7 mt-0 md:-mt-20 aspect-square",
  },
  {
    src: "hq-johnny-5ueL8eU0.webp",
    title: "Johnny Depp",
    span: "col-span-1 md:col-span-12 mt-12 md:mt-40 aspect-[21/9]",
  },
  {
    src: "marilyn-rocks--qPeLHxE.webp",
    title: "Marilyn Rocks",
    span: "col-span-1 md:col-span-5 md:col-start-1 mt-0 aspect-[4/5]",
  },
  {
    src: "audrey-hepburn-DbIBTtIp.webp",
    title: "Audrey Hepburn",
    span: "col-span-1 md:col-span-6 md:col-start-7 mt-0 md:mt-32 aspect-[4/5]",
  },
  {
    src: "geisha-MfRtKWdu.webp",
    title: "Geisha",
    span: "col-span-1 md:col-span-8 md:col-start-3 mt-12 md:mt-24 aspect-[16/9]",
  },
  {
    src: "lagrimas-de-oro-DikHc-Tk.webp",
    title: "Lágrimas de Oro",
    span: "col-span-1 md:col-span-5 md:col-start-1 mt-0 md:mt-12 aspect-[3/4]",
  },
  {
    src: "love-DA7L_L5F.webp",
    title: "Love",
    span: "col-span-1 md:col-span-5 md:col-start-8 mt-0 md:-mt-32 aspect-square",
  },
  {
    src: "la-pensadora-CFHSnMA0.webp",
    title: "La Pensadora",
    span: "col-span-1 md:col-span-10 md:col-start-2 mt-12 md:mt-40 aspect-video",
  },
];

export default function Home() {
  const [artworks, setArtworks] = useState(baseArtworks);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [takeoverArtwork, setTakeoverArtwork] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [takeoverCountdown, setTakeoverCountdown] = useState(4);
  const [appMode, setAppMode] = useState<"CAOS" | "ORDEN">("CAOS");

  useEffect(() => {
    let takeoverTimeoutId: NodeJS.Timeout;
    let countdownIntervalId: NodeJS.Timeout;

    if (appMode === "ORDEN") {
      return;
    }

    const runTakeover = () => {
      const randomArt =
        baseArtworks[Math.floor(Math.random() * baseArtworks.length)];
      setTakeoverArtwork(randomArt);
      setTakeoverCountdown(4);
      document.body.style.overflow = "hidden";

      let count = 4;
      countdownIntervalId = setInterval(() => {
        count -= 1;
        setTakeoverCountdown(count);
      }, 1000);

      takeoverTimeoutId = setTimeout(() => {
        setTakeoverArtwork(null);
        document.body.style.overflow = "auto";
        clearInterval(countdownIntervalId);
      }, 4000);
    };

    // Cycle every 17s (13s interactive + 4s block takeover)
    const cycleIntervalId = setInterval(() => {
      runTakeover();
    }, 17000);

    // First trigger after 13 seconds
    const initialDelayId = setTimeout(() => {
      runTakeover();
    }, 13000);

    return () => {
      clearInterval(cycleIntervalId);
      clearTimeout(takeoverTimeoutId);
      clearInterval(countdownIntervalId);
      clearTimeout(initialDelayId);
      document.body.style.overflow = "auto";
    };
  }, [appMode]);

  useEffect(() => {
    const lenis = new Lenis();
    let animationId: number;
    function raf(time: number) {
      lenis.raf(time);
      const velocity = lenis.velocity;
      const direction = lenis.direction;
      document.documentElement.style.setProperty(
        "--scroll-velocity",
        Math.abs(velocity).toString(),
      );
      document.documentElement.style.setProperty(
        "--scroll-direction",
        direction.toString(),
      );
      animationId = requestAnimationFrame(raf);
    }
    animationId = requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(animationId);
    };
  }, []);

  const [activeColor, setActiveColor] = useState("#2B3BE5");

  const updatePrimaryColor = (hex: string) => {
    if (typeof window === "undefined") return;
    document.documentElement.style.setProperty("--primary", hex);
    document.documentElement.style.setProperty("--color-primary", hex);
    document.documentElement.style.setProperty("--accent", hex);

    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    document.documentElement.style.setProperty(
      "--primary-rgb",
      `${r}, ${g}, ${b}`,
    );

    localStorage.setItem("naroa_primary_color", hex);
    setActiveColor(hex);
    window.dispatchEvent(
      new CustomEvent("naroa-color-change", { detail: hex }),
    );
  };

  useEffect(() => {
    const palettes = [
      "#2B3BE5",
      "#C6A87C",
      "#10B981",
      "#D9383A",
      "#D97706",
      "#8B5CF6",
      "#06B6D4",
    ];
    let selectedColor = localStorage.getItem("naroa_primary_color");
    if (!selectedColor) {
      selectedColor = palettes[Math.floor(Math.random() * palettes.length)];
      localStorage.setItem("naroa_primary_color", selectedColor);
    }
    setTimeout(() => {
      updatePrimaryColor(selectedColor);
    }, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setArtworks((prev) => [...prev, ...baseArtworks]);
        }
      },
      { threshold: 0.1, rootMargin: "600px" },
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`flex flex-col min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-black ${appMode === "ORDEN" ? "bg-[#050505]" : ""}`}
    >
      {appMode === "CAOS" && (
        <div
          id="webgl-container"
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <WebGLBackground />
        </div>
      )}
      {appMode === "CAOS" && <PaintTrail />}
      {appMode === "CAOS" && <DepthHUD />}
      {appMode === "CAOS" && <SOTAFX />}
      {appMode === "CAOS" && <Mica />}
      <section className="relative w-full h-screen flex flex-col justify-between overflow-hidden px-6 sm:px-12 py-12">
        {appMode === "CAOS" && <HeroFluid />}
        <div
          className={`absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(43,59,229,0.15)_0%,transparent_50%)] z-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-1000 ${appMode === "ORDEN" ? "opacity-30" : "opacity-100"}`}
        />
        <div className="relative z-10 w-full flex justify-between items-start animate-[fadeIn_2s_ease-out]">
          <span className="text-foreground/40 font-sans tracking-[0.2em] text-[9px] uppercase">
            Acrílico sobre pizarra
          </span>
          <span className="text-foreground/40 font-sans tracking-[0.2em] text-[9px] uppercase">
            Bilbao
          </span>
        </div>
        <div
          className={`relative z-10 flex flex-col items-start w-full max-w-[1800px] mx-auto mb-auto min-h-[50vh] justify-center transition-all duration-1000 ${appMode === "ORDEN" ? "mt-32 items-center text-center" : "mt-20"}`}
        >
          <h1
            className={`relative flex flex-col w-full text-[15vw] leading-[0.75] font-serif tracking-tighter uppercase select-none transition-all duration-1000 ${appMode === "ORDEN" ? "font-medium text-center items-center gap-4" : "font-light"}`}
          >
            <span className="flex overflow-hidden z-10">
              <span
                className={`animate-[slideUp_1.5s_cubic-bezier(0.16,1,0.3,1)_0.1s_both] mix-blend-difference ${appMode === "ORDEN" ? "text-foreground opacity-100 [-webkit-text-stroke:0px]" : "text-transparent [-webkit-text-stroke:1px_var(--color-foreground)] sm:[-webkit-text-stroke:2px_var(--color-foreground)] opacity-50"}`}
              >
                Naroa
              </span>
            </span>
            <span
              className={`absolute top-[20%] z-30 pointer-events-none w-full transition-all duration-1000 ${appMode === "ORDEN" ? "left-0 text-center top-[40%] opacity-90" : "left-[5%] sm:left-[12%]"}`}
            >
              <span
                className={`inline-block animate-[slideUp_2s_cubic-bezier(0.16,1,0.3,1)_0.4s_both] text-primary mix-blend-screen transition-all duration-1000 ${appMode === "ORDEN" ? "font-serif uppercase tracking-widest text-[8vw] sm:text-[6vw] rotate-0 drop-shadow-none opacity-80 mt-12" : "font-hand normal-case tracking-normal text-[26vw] sm:text-[22vw] -rotate-6 drop-shadow-[0_20px_50px_rgba(43,59,229,0.5)]"}`}
              >
                Gutiérrez
              </span>
            </span>
            <span
              className={`flex overflow-hidden z-20 transition-all duration-1000 ${appMode === "ORDEN" ? "self-center mt-8 mr-0" : "self-end mr-[2vw] sm:mr-[8vw] mt-[2vw]"}`}
            >
              <span className="animate-[slideUp_1.5s_cubic-bezier(0.16,1,0.3,1)_0.2s_both] text-foreground mix-blend-difference">
                Gil
              </span>
            </span>
          </h1>
        </div>
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-end items-end gap-12 mt-auto max-w-[1800px] mx-auto animate-[fadeIn_3s_ease-out_1s_both]">
          <a
            href="/biografia"
            aria-label="Explorar la biografía"
            className="group flex items-center gap-6 text-foreground/30 hover:text-primary transition-colors duration-700 cursor-pointer"
          >
            <span className="uppercase font-sans tracking-[0.4em] text-[9px] font-medium rotate-180 [writing-mode:vertical-rl]">
              Biografía
            </span>
            <div className="w-[1px] h-32 bg-foreground/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-primary animate-[translateY_2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
            </div>
          </a>
          <a
            href="#galeria"
            aria-label="Descender a la galería"
            className="group flex items-center gap-6 text-foreground/30 hover:text-primary transition-colors duration-700 cursor-pointer"
          >
            <span className="uppercase font-sans tracking-[0.4em] text-[9px] font-medium rotate-180 [writing-mode:vertical-rl]">
              Descender
            </span>
            <div className="w-[1px] h-32 bg-foreground/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-primary animate-[translateY_2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
            </div>
          </a>
        </div>
      </section>
      <section
        id="galeria"
        className="relative z-10 px-4 sm:px-12 py-32 max-w-[1800px] mx-auto w-full"
      >
        <div className="mb-40 text-center flex flex-col items-center">
          <h2 className="text-5xl sm:text-7xl font-serif font-light tracking-wide text-foreground leading-tight max-w-2xl mx-auto uppercase">
            Obras
          </h2>
          <div className="w-px h-16 bg-gradient-to-b from-primary/30 to-transparent mt-12"></div>
        </div>
        <div
          className={`grid gap-8 md:gap-x-12 w-full px-0 md:px-12 transition-all duration-1000 ${appMode === "ORDEN" ? "grid-cols-1 md:grid-cols-3 gap-y-16 items-start" : "grid-cols-1 md:grid-cols-12 md:gap-y-0 items-start"}`}
        >
          {artworks.map((artwork, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden bg-[#0A0A0A] rounded-sm ring-1 ring-white/5 shadow-2xl w-full transition-all duration-1000 ${appMode === "ORDEN" ? "col-span-1 aspect-[4/5] mt-0 mb-8" : artwork.span || "md:col-span-12 aspect-[4/3]"}`}
            >
              <Image
                src={getImageUrl(artwork.src)}
                alt={artwork.title}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                quality={100}
                className={`object-cover transition-all duration-[3.5s] ease-out will-change-transform transform-gpu ${appMode === "ORDEN" ? "grayscale-[0.2] hover:grayscale-0" : "grayscale-0 contrast-[1.02] brightness-100 group-hover:scale-[1.06] group-hover:brightness-[1.03]"}`}
                priority={i < 4}
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(43,59,229,0.12)_0%,transparent_50%)] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <div className="absolute bottom-6 left-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-y-4 group-hover:translate-y-0">
                <span className="text-foreground/80 font-sans tracking-[0.2em] text-[10px] uppercase bg-black/50 px-3 py-1 backdrop-blur-md border border-white/10 rounded-sm">
                  {artwork.title}
                </span>
              </div>
            </div>
          ))}
          <div
            ref={observerRef}
            className="col-span-1 md:col-span-12 h-32 w-full flex justify-center items-center"
          >
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

      {/* ── SPLAT PHYSICS / FORJA DE AURA ── */}
      {appMode === "CAOS" && (
        <section className="relative z-10 py-32 px-4 sm:px-12 bg-[#050505] border-t border-white/5">
          <SplatPhysicsTester />
        </section>
      )}

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

          <div className="flex flex-col gap-4 mb-20 items-center">
            <a
              href="https://naroa.online"
              aria-label="Acceder al Laboratorio Kinético SOTA"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 text-primary/50 hover:text-primary transition-colors duration-500 px-8 py-3 border border-primary/20 hover:border-primary/50 rounded-sm w-full max-w-sm justify-center"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-sans text-[9px] tracking-[0.4em] uppercase">
                Laboratorio Kinético
              </span>
            </a>

            <a
              href="/test-physics"
              aria-label="Motor WebGPU Splat Physics"
              className="group flex items-center gap-4 text-white/30 hover:text-white transition-colors duration-500 px-8 py-3 border border-white/10 hover:border-white/30 rounded-sm w-full max-w-sm justify-center"
            >
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase">
                WebGPU Physics Engine
              </span>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-3xl pt-12 border-t border-white/5 text-foreground/30 font-sans text-xs tracking-widest uppercase">
            <span>
              © 2026 Naroa Gutiérrez Gil · Creado por{" "}
              <a
                href="https://www.borjamoskv.com"
                aria-label="Web de Borja Moskv"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors duration-500"
              >
                Borja Moskv
              </a>
            </span>
            <span className="mt-4 sm:mt-0">Bilbao, Spain</span>
          </div>
        </div>
      </footer>

      {/* Floating Color Mutator Dock & Mode Toggle */}
      <div className="fixed bottom-8 left-8 z-[130] flex flex-col gap-4 items-start select-none">
        {/* Mode Toggle */}
        <div className="flex gap-2 items-center bg-[#0c0c0e]/80 border border-white/5 px-4 py-2.5 rounded-sm backdrop-blur-md">
          <button
            onClick={() => setAppMode("CAOS")}
            className={`font-sans text-[9px] tracking-[0.25em] uppercase px-3 py-1 transition-all duration-500 rounded-sm ${appMode === "CAOS" ? "text-white bg-white/10" : "text-white/40 hover:text-white/70"}`}
          >
            Caos
          </button>
          <div className="w-px h-3 bg-white/20" />
          <button
            onClick={() => setAppMode("ORDEN")}
            className={`font-sans text-[9px] tracking-[0.25em] uppercase px-3 py-1 transition-all duration-500 rounded-sm ${appMode === "ORDEN" ? "text-white bg-white/10" : "text-white/40 hover:text-white/70"}`}
          >
            Orden
          </button>
        </div>

        {/* Color Toggle */}
        <div className="flex gap-2.5 items-center bg-[#0c0c0e]/80 border border-white/5 px-4 py-2.5 rounded-sm backdrop-blur-md">
          <span className="font-sans text-[8px] tracking-[0.25em] uppercase text-white/40 mr-1">
            Muta
          </span>
          {[
            "#2B3BE5",
            "#C6A87C",
            "#10B981",
            "#D9383A",
            "#D97706",
            "#8B5CF6",
            "#06B6D4",
          ].map((color) => (
            <button
              key={color}
              onClick={() => updatePrimaryColor(color)}
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 relative cursor-pointer ${
                activeColor === color
                  ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                  : "border-white/10 hover:scale-125"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Mutar color a ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Takeover Artwork Amplification Modal */}
      {takeoverArtwork && (
        <div className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col justify-center items-center overflow-hidden animate-[fadeIn_0.5s_ease-out]">
          {/* Grain texture overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

          {/* Chromatic aberration background aura */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb,43,59,229),0.12)_0%,transparent_60%)] mix-blend-color-dodge pointer-events-none" />

          {/* Outlined CRONOS Watermark */}
          <div className="absolute top-[8%] left-[5%] font-mono text-[16vw] leading-none font-black text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.03)] uppercase pointer-events-none select-none z-0">
            CRONOS
          </div>

          {/* Amplified Artwork container with linear zoom animation */}
          <div className="relative w-[85vw] h-[85vh] md:w-[60vw] md:h-[80vh] border border-white/10 rounded-sm overflow-hidden bg-black shadow-[0_0_80px_rgba(0,0,0,0.9)] animate-[pulseScale_4s_linear] z-10">
            <Image
              src={getImageUrl(takeoverArtwork.src)}
              alt={takeoverArtwork.title}
              fill
              className="object-cover contrast-[1.05] brightness-95"
              sizes="(max-width: 768px) 100vw, 80vw"
              quality={100}
              priority
            />
          </div>

          {/* HUD info overlays */}
          <div className="absolute bottom-8 left-8 right-8 z-[100] flex flex-col md:flex-row md:items-end justify-between pointer-events-none">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] tracking-[0.4em] uppercase text-primary font-bold animate-pulse">
                SISTEMA CRONOS // BLOQUEO MULTIDIMENSIONAL
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-light uppercase tracking-wide text-foreground">
                {takeoverArtwork.title}
              </h2>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[9px] tracking-[0.2em] uppercase text-white/30">
                  CRONOS COUNTDOWN
                </span>
                <span className="text-4xl font-mono font-light text-primary">
                  {takeoverCountdown}.00s
                </span>
              </div>
              <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 w-full bg-primary transition-all duration-[4000ms] ease-linear"
                  style={{ height: `${(takeoverCountdown / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
