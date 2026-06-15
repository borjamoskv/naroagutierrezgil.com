"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const isHoveringRef = useRef(false);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  // Initialize mouse position to center screen
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

  // Kintsugi Trail Canvas Logic
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
      // Jitter (cracking) increases with scroll velocity
      const jitterMultiplier = 1 + Math.min(velocity * 0.1, 10);
      const jitterX = (Math.random() - 0.5) * 2 * jitterMultiplier;
      const jitterY = (Math.random() - 0.5) * 2 * jitterMultiplier;
      points.push({ x: e.clientX + jitterX, y: e.clientY + jitterY, timestamp: performance.now() });
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
      
      // Decay points using absolute time for framerate independence
      const now = performance.now();
      points = points.filter(p => now - p.timestamp < 400);

      if (points.length > 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 1; i++) {
          const p = points[i];
          const nextP = points[i + 1];
          const xc = (p.x + nextP.x) / 2;
          const yc = (p.y + nextP.y) / 2;
          ctx.quadraticCurveTo(p.x, p.y, xc, yc);
        }
        
        const lastP = points[points.length - 1];
        ctx.lineTo(lastP.x, lastP.y);
        
        // Kintsugi Gold Trail with velocity styling
        const opacity = Math.min(0.8 + velocity * 0.02, 1.0);
        const lineWidth = 1.5 * (1 + Math.min(velocity * 0.05, 3));
        const glow = 8 + Math.min(velocity * 1.5, 30);
        
        ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "bevel";
        ctx.shadowBlur = glow;
        ctx.shadowColor = `rgba(212, 175, 55, ${0.5 + Math.min(velocity * 0.05, 0.5)})`;
        ctx.stroke();
      }

      // Update gold spark position, scale, and glow based on hover & scroll velocity
      if (cursorRef.current) {
        const scale = 1 + Math.min(velocity * 0.08, 4);
        const glow = 10 + Math.min(velocity * 5, 40);
        cursorRef.current.style.transform = `translate3d(${mouseXRef.current}px, ${mouseYRef.current}px, 0) scale(${scale})`;
        cursorRef.current.style.boxShadow = `0 0 ${glow}px rgba(212, 175, 55, 0.9), 0 0 2px rgba(255, 255, 255, 0.9)`;
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
      
      {/* Outer position tracking element (Zero CSS transition on transform) */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-1.5 h-1.5 pointer-events-none z-[9999] mix-blend-screen -translate-x-1/2 -translate-y-1/2 will-change-transform"
      >
        {/* Inner element handling hover scaling smoothly via CSS transition */}
        <div
          className="w-full h-full rounded-full transition-transform duration-300 cubic-bezier(0.25, 1, 0.5, 1)"
          style={{
            backgroundColor: '#D4AF37',
            transform: isHovering ? 'scale(2.5)' : 'scale(1)',
            animation: 'thermalPulse 2s infinite alternate ease-in-out'
          }}
        />
        <style jsx>{`
          @keyframes thermalPulse {
            0% { opacity: 0.6; filter: brightness(1); }
            100% { opacity: 1; filter: brightness(1.5); }
          }
        `}</style>
      </div>
    </>
  );
}
