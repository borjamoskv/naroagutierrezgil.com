"use client";

import { useEffect, useRef } from "react";

export default function PaintTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      points.push({ x: e.clientX, y: e.clientY, age: 0 });
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
      
      // Envejece los puntos para que el rastro se desvanezca
      points.forEach(p => p.age += 1);
      points = points.filter(p => p.age < 60);

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
        
        // Aplicamos el color primario (Cobalt Blue Noir 2026) con opacidad dinámica
        ctx.strokeStyle = "rgba(43, 59, 229, 0.15)";
        ctx.lineWidth = 120; // Rastro grueso como brocha de acrílico
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
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

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45] mix-blend-screen"
      style={{ filter: "blur(24px) contrast(1.5)" }}
    />
  );
}
