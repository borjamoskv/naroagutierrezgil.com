"use client";

import { useEffect, useRef, useState } from "react";
import { useAgent } from "agents/react";
import type { EntropicCanvasAgent, EntropicState } from "@/agents/EntropicCanvasAgent";

export default function PaintTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [entropy, setEntropy] = useState<number>(0);

  // C5-REAL: Conectar Pizarra con Agente Entrópico
  const agent = useAgent<EntropicCanvasAgent, EntropicState>({
    agent: "EntropicCanvasAgent",
    name: "global-canvas",
    onStateUpdate: (state: EntropicState) => {
      setEntropy(state.globalEntropy || 0);
    }
  });

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
    let accumForce = 0;
    let lastCallTime = Date.now();

    const handlePointerMove = (e: PointerEvent) => {
      points.push({ x: e.clientX, y: e.clientY, age: 0 });
      accumForce += Math.abs(e.movementX) + Math.abs(e.movementY);

      // Throttled Entropic Friction RPC
      if (Date.now() - lastCallTime > 500 && accumForce > 50) {
        agent.stub.applyFriction(e.clientX, e.clientY, accumForce * 0.05).catch(console.error);
        accumForce = 0;
        lastCallTime = Date.now();
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
        
        // El color cambia ligeramente según la entropía global
        const rBase = Math.min(43 + entropy * 1.5, 255);
        const gBase = 59;
        const bBase = Math.max(229 - entropy * 2, 0);

        ctx.strokeStyle = `rgba(${rBase}, ${gBase}, ${bBase}, 0.15)`;
        ctx.lineWidth = 120; // Rastro grueso
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
  }, [agent, entropy]);

  // Si la entropía sube, el desenfoque baja (se vuelve más nítido y violento)
  const blurAmount = Math.max(24 - (entropy * 0.2), 4);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45] mix-blend-screen transition-all duration-500"
      style={{ filter: `blur(${blurAmount}px) contrast(1.5)` }}
    />
  );
}
