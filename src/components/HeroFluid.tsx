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

    const noiseWidth = 256;
    const noiseHeight = 256;
    
    // Pre-render 6 frames of noise
    const frames: HTMLCanvasElement[] = [];
    for (let f = 0; f < 6; f++) {
      const frameCanvas = document.createElement("canvas");
      frameCanvas.width = noiseWidth;
      frameCanvas.height = noiseHeight;
      const frameCtx = frameCanvas.getContext("2d");
      if (frameCtx) {
        const imgData = frameCtx.createImageData(noiseWidth, noiseHeight);
        const data = new Uint32Array(imgData.data.buffer);
        for (let i = 0; i < data.length; i++) {
          const val = Math.random() > 0.5 ? 255 : 0;
          data[i] = (255 << 24) | (val << 16) | (val << 8) | val;
        }
        frameCtx.putImageData(imgData, 0, 0);
        frames.push(frameCanvas);
      }
    }

    let frameIdx = 0;
    let rafId: number;
    let lastTime = 0;
    let isVisible = true;

    const render = (time: number) => {
      if (!isVisible) return;
      // Throttle a 15fps para un efecto cinemático analógico
      if (time - lastTime > 66) { 
        if (frames[frameIdx]) {
          const pattern = ctx.createPattern(frames[frameIdx], 'repeat');
          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, width, height);
          }
        }
        frameIdx = (frameIdx + 1) % frames.length;
        lastTime = time;
      }
      rafId = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          lastTime = performance.now();
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(render);
        } else {
          cancelAnimationFrame(rafId);
        }
      });
    }, { threshold: 0 });
    
    observer.observe(canvas);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
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
