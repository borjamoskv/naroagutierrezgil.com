"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let rafId: number;

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(rafId);
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

    let points: { x: number; y: number; age: number }[] = [];
    let rafId: number;

    const handlePointerMove = (e: PointerEvent) => {
      // Agregamos puntos con un poco de "ruido" para simular la rotura orgánica de la piedra
      const jitterX = (Math.random() - 0.5) * 2;
      const jitterY = (Math.random() - 0.5) * 2;
      points.push({ x: e.clientX + jitterX, y: e.clientY + jitterY, age: 0 });
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
      
      // Envejece los puntos rápidamente (cicatriza y disuelve)
      points.forEach(p => p.age += 1);
      points = points.filter(p => p.age < 25); // Desaparece rápido

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
        
        // Efecto Kintsugi: Oro líquido (#D4AF37)
        ctx.strokeStyle = `rgba(212, 175, 55, 0.8)`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "bevel"; // Cortes más afilados
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(212, 175, 55, 0.5)";
        ctx.stroke();
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
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);
    return () => {
      document.body.style.cursor = "auto";
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      {/* Kintsugi Trail Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998] mix-blend-screen"
      />
      
      {/* Chispa de oro latente (Pulso térmico) */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-1.5 h-1.5 pointer-events-none z-[9999] mix-blend-screen -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out"
        style={{
          backgroundColor: '#D4AF37',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.8), 0 0 2px rgba(255, 255, 255, 0.8)',
          transform: isHovering ? 'scale(2.5)' : 'scale(1)',
          animation: 'thermalPulse 2s infinite alternate ease-in-out'
        }}
      >
        <style jsx>{`
          @keyframes thermalPulse {
            0% { opacity: 0.6; filter: brightness(1); transform: scale(1); }
            100% { opacity: 1; filter: brightness(1.5); transform: scale(1.2); }
          }
        `}</style>
      </div>
    </>
  );
}
