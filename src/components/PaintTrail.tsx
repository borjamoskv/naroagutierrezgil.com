"use client";

import { useEffect, useRef, useState } from "react";

export default function PaintTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [entropy, setEntropy] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
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
        
        const rBase = Math.min(43 + entropy * 1.5, 255);
        const gBase = 59;
        const bBase = Math.max(229 - entropy * 2, 0);

        ctx.strokeStyle = `rgba(${rBase}, ${gBase}, ${bBase}, 0.15)`;
        ctx.lineWidth = 120;
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
  }, [entropy]);

  const blurAmount = Math.max(24 - (entropy * 0.2), 4);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45] mix-blend-screen transform-gpu"
      style={{ filter: `blur(${blurAmount}px) contrast(1.5)`, willChange: 'filter' }}
    />
  );
}
