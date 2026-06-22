"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    setPrefersReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const isHoveringRef = useRef(false);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  useEffect(() => {
    mouseXRef.current = window.innerWidth / 2;
    mouseYRef.current = window.innerHeight / 2;
  }, []);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hovering = !!(
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button")
      );
      setIsHovering(hovering);
      isHoveringRef.current = hovering;
    };

    window.addEventListener("pointermove", onPointerMove);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  // Glitch Laser Trail Canvas Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let points: { x: number; y: number; timestamp: number }[] = [];
    let rafId: number;

    const handlePointerMove = (e: PointerEvent) => {
      const velocity = (window as any).__scrollVelocity || 0;
      const jitterMultiplier = 1 + Math.min(velocity * 0.2, 15);
      const jitterX = (Math.random() - 0.5) * 4 * jitterMultiplier;
      const jitterY = (Math.random() - 0.5) * 4 * jitterMultiplier;
      
      // Strict straight lines occasionally (glitch)
      if (Math.random() > 0.8 && points.length > 0) {
        points.push({ x: points[points.length - 1].x, y: e.clientY, timestamp: performance.now() });
      } else {
        points.push({ x: e.clientX + jitterX, y: e.clientY + jitterY, timestamp: performance.now() });
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      const velocity = (window as any).__scrollVelocity || 0;
      const now = performance.now();
      points = points.filter(p => now - p.timestamp < 200); // Super fast decay for electric feel

      if (points.length > 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
          const p = points[i];
          // Sharp angles instead of smooth curves for "industrial laser" feel
          ctx.lineTo(p.x, p.y);
        }
        
        const opacity = Math.min(0.6 + velocity * 0.05, 1.0);
        const lineWidth = 1 + Math.min(velocity * 0.02, 2);
        const glow = 10 + Math.min(velocity * 2, 40);
        
        const primaryRGB = typeof window !== 'undefined' 
          ? getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim() 
          : '43, 59, 229';
        const rgb = primaryRGB || '43, 59, 229';
        ctx.strokeStyle = `rgba(${rgb}, ${opacity})`;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "square";
        ctx.lineJoin = "miter";
        ctx.miterLimit = 2;
        ctx.shadowBlur = glow;
        ctx.shadowColor = `rgba(${rgb}, ${0.8 + Math.min(velocity * 0.05, 0.5)})`;
        ctx.stroke();

        // Secondary inner core line (white)
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
        ctx.lineWidth = lineWidth * 0.3;
        ctx.shadowBlur = 0;
        ctx.stroke();
      }

      if (cursorRef.current) {
        const scale = 1 + Math.min(velocity * 0.05, 3);
        const glow = 15 + Math.min(velocity * 5, 50);
        const primaryHex = typeof window !== 'undefined'
          ? getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
          : '#2B3BE5';
        cursorRef.current.style.transform = `translate3d(${mouseXRef.current}px, ${mouseYRef.current}px, 0) scale(${scale})`;
        cursorRef.current.style.boxShadow = `0 0 ${glow}px ${primaryHex || '#2B3BE5'}, 0 0 5px rgba(255, 255, 255, 1)`;
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.textContent = `* { cursor: none !important; }`;
    document.head.appendChild(style);
    return () => {
      document.body.style.cursor = "auto";
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998] mix-blend-screen"
      />
      
      {/* Reticle cursor instead of dot */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-3 h-3 pointer-events-none z-[9999] mix-blend-screen -translate-x-1/2 -translate-y-1/2 will-change-transform flex items-center justify-center"
      >
        <div
          className="relative w-full h-full transition-transform duration-200 cubic-bezier(0.25, 1, 0.5, 1)"
          style={{
            transform: isHovering ? 'scale(2) rotate(45deg)' : 'scale(1) rotate(0deg)'
          }}
        >
          {/* Top/Bottom bars */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[3px] bg-white shadow-[0_0_8px_var(--primary)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-[3px] bg-white shadow-[0_0_8px_var(--primary)]" />
          {/* Left/Right bars */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[3px] h-[2px] bg-white shadow-[0_0_8px_var(--primary)]" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[3px] h-[2px] bg-white shadow-[0_0_8px_var(--primary)]" />
          
          {/* Core pulse */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[2px] bg-[var(--primary)] rounded-full transition-opacity" style={{ opacity: isHovering ? 1 : 0 }} />
        </div>
      </div>
    </>
  );
}
