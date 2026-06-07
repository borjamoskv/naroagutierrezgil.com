"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import WebGLBackground from "@/components/WebGLBackground";

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <WebGLBackground />

      <div className="z-10 text-center max-w-4xl px-6 mix-blend-difference">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase mb-4 opacity-90">
          Naroa Gutiérrez Gil
        </h1>
        <p className="text-xl md:text-2xl text-[#2B3BE5] font-light tracking-wide mb-8">
          La materia antes que la imagen.
        </p>

        <div className="flex flex-col gap-2 text-sm md:text-base opacity-70">
          <p>ESTADO: ESPERANDO FLUJO GAUSSIANO (.SPLAT)</p>
          <p>ESTILO: INDUSTRIAL NOIR 2026</p>
          <p>PROTOCOLOS: C5-REAL | KINTSUGI DIGITAL</p>
        </div>
      </div>
    </main>
  );
}
