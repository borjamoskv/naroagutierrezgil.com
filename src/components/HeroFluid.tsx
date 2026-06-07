"use client";

import { useEffect, useRef } from "react";

export default function HeroFluid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let noiseData = ctx.createImageData(width, height);
    let buffer32 = new Uint32Array(noiseData.data.buffer);
    
    const generateNoise = () => {
      for (let i = 0; i < buffer32.length; i++) {
        // High contrast monochrome noise
        const val = Math.random() > 0.5 ? 255 : 0;
        buffer32[i] = (255 << 24) | (val << 16) | (val << 8) | val;
      }
      ctx.putImageData(noiseData, 0, 0);
    };

    let rafId: number;
    let lastTime = 0;

    const render = (time: number) => {
      // Throttle a 15fps para un efecto cinemático analógico
      if (time - lastTime > 66) { 
        generateNoise();
        lastTime = time;
      }
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      noiseData = ctx.createImageData(width, height);
      buffer32 = new Uint32Array(noiseData.data.buffer);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
      />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#0A0A0A_120%)] opacity-90" />
    </>
  );
}
