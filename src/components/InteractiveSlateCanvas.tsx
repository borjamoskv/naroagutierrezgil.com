"use client";

import React, { useRef, useEffect } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  decay: number;
}

interface CrackSegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  alpha: number;
  width: number;
  decay: number;
}

interface InteractiveSlateCanvasProps {
  disabled?: boolean;
}

/**
 * InteractiveSlateCanvas component for immersive slate carving and kintsugi effects.
 * Fuses slate carving visual metaphors with glowing gold paths on drag/interaction.
 * 
 * Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
 */
export default function InteractiveSlateCanvas({ disabled = false }: InteractiveSlateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, px: 0, py: 0, isDown: false, active: false });
  const disabledRef = useRef(disabled);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];
    const cracks: CrackSegment[] = [];
    let rafId: number;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerRef.current.isDown = true;
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      pointerRef.current.px = e.clientX;
      pointerRef.current.py = e.clientY;
      pointerRef.current.active = true;

      // Spawn kintsugi burst
      spawnGoldBurst(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      pointerRef.current.isDown = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      pointerRef.current.active = true;
      pointerRef.current.px = pointerRef.current.x;
      pointerRef.current.py = pointerRef.current.y;
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;

      if (pointerRef.current.isDown) {
        // Carving/Kintsugi mode: add golden crack segment
        const dist = Math.hypot(pointerRef.current.x - pointerRef.current.px, pointerRef.current.y - pointerRef.current.py);
        if (dist > 2) {
          cracks.push({
            startX: pointerRef.current.px,
            startY: pointerRef.current.py,
            endX: pointerRef.current.x,
            endY: pointerRef.current.y,
            alpha: 1.0,
            width: Math.random() * 2 + 1.5,
            decay: 0.008 + Math.random() * 0.005,
          });

          // Branching cracks (fractal-like kintsugi)
          if (Math.random() > 0.75) {
            const angle = Math.atan2(pointerRef.current.y - pointerRef.current.py, pointerRef.current.x - pointerRef.current.px);
            const branchAngle = angle + (Math.random() - 0.5) * 1.5;
            const branchLength = Math.random() * 25 + 10;
            const bx = pointerRef.current.x + Math.cos(branchAngle) * branchLength;
            const by = pointerRef.current.y + Math.sin(branchAngle) * branchLength;
            cracks.push({
              startX: pointerRef.current.x,
              startY: pointerRef.current.y,
              endX: bx,
              endY: by,
              alpha: 0.8,
              width: Math.random() * 1.2 + 0.8,
              decay: 0.015,
            });
          }

          // Spawn gold dust particles
          for (let i = 0; i < 3; i++) {
            particles.push({
              x: pointerRef.current.x,
              y: pointerRef.current.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              alpha: 1.0,
              size: Math.random() * 2.5 + 1.0,
              color: `rgba(245, 158, 11, ${Math.random() * 0.5 + 0.5})`, // Gold
              decay: 0.015 + Math.random() * 0.01,
            });
          }
        }
      } else {
        // Hover mode: subtle white/blue dust trails (slate interaction)
        if (Math.random() > 0.4) {
          particles.push({
            x: pointerRef.current.x,
            y: pointerRef.current.y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            alpha: 0.7,
            size: Math.random() * 1.5 + 0.5,
            color: Math.random() > 0.5 ? "rgba(43, 59, 229, 0.4)" : "rgba(255, 255, 255, 0.3)", // Slate Blue/White
            decay: 0.01 + Math.random() * 0.008,
          });
        }
      }
    };

    const spawnGoldBurst = (x: number, y: number) => {
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1.0,
          size: Math.random() * 3 + 1,
          color: "rgba(245, 158, 11, 0.9)", // Gold
          decay: 0.02 + Math.random() * 0.015,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointermove", handlePointerMove);

    // Animation Loop
    const update = () => {
      if (disabledRef.current) {
        ctx.clearRect(0, 0, width, height);
        rafId = requestAnimationFrame(update);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      // Render & update cracks
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      for (let i = cracks.length - 1; i >= 0; i--) {
        const c = cracks[i];
        c.alpha -= c.decay;
        if (c.alpha <= 0) {
          cracks.splice(i, 1);
          continue;
        }

        // Draw shadow/glow behind the line
        ctx.beginPath();
        ctx.moveTo(c.startX, c.startY);
        ctx.lineTo(c.endX, c.endY);
        ctx.strokeStyle = `rgba(245, 158, 11, ${c.alpha * 0.2})`;
        ctx.lineWidth = c.width * 4;
        ctx.stroke();

        // Draw core line
        ctx.beginPath();
        ctx.moveTo(c.startX, c.startY);
        ctx.lineTo(c.endX, c.endY);
        ctx.strokeStyle = `rgba(245, 158, 11, ${c.alpha})`;
        ctx.lineWidth = c.width;
        ctx.stroke();
      }

      // Render & update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98; // Friction
        p.vy *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.alpha})`);
        ctx.fill();
      }

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10 mix-blend-screen"
    />
  );
}
