"use client";

import { useEffect, useRef } from "react";

export default function DepthHUD() {
  const hudRef = useRef<HTMLDivElement>(null);
  const velocityRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let rafId: number;
    const start = Date.now();

    const updateHUD = () => {
      // Lenis injects CSS variables into the root element in page.tsx
      const velocityStr = document.documentElement.style.getPropertyValue("--scroll-velocity") || "0";
      const velocity = parseFloat(velocityStr);
      
      if (velocityRef.current) {
        velocityRef.current.innerText = `V_SCROLL: ${velocity.toFixed(3)}`;
      }

      if (timeRef.current) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(2);
        timeRef.current.innerText = `T_RUNTIME: ${elapsed}s`;
      }

      // Dynamic distortion based on scroll velocity (Kinetic UI physics)
      if (hudRef.current) {
        const skew = Math.min(velocity * 0.2, 5);
        const blur = Math.min(velocity * 0.1, 4);
        hudRef.current.style.transform = `skewY(${-skew}deg) translateY(${velocity * 0.5}px)`;
        hudRef.current.style.filter = `blur(${blur}px)`;
      }

      rafId = requestAnimationFrame(updateHUD);
    };

    rafId = requestAnimationFrame(updateHUD);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div 
      ref={hudRef} 
      className="fixed top-6 left-6 z-50 pointer-events-none mix-blend-difference hidden md:flex flex-col gap-1 text-[9px] font-mono tracking-[0.2em] text-[#EAEAEA] uppercase transition-all duration-75 ease-out opacity-60"
    >
      <span className="text-[#2B3BE5] font-bold">STATE: C5-REAL</span>
      <span>Z-INDEX: VOLUMÉTRICO</span>
      <span>LOD: ADAPTATIVO</span>
      <span className="opacity-50">SPLAT_ENGINE: AWAITING BENCHMARK 0</span>
      <span ref={velocityRef} className="mt-2 text-primary">V_SCROLL: 0.000</span>
      <span ref={timeRef} className="opacity-50">T_RUNTIME: 0.00s</span>
    </div>
  );
}
