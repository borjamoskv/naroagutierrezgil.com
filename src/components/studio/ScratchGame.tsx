'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Artwork {
  src: string;
  title: string;
}

interface ScratchGameProps {
  artworks: Artwork[];
}

export default function ScratchGame({ artworks }: ScratchGameProps) {
  const [selectedArt, setSelectedArt] = useState(artworks[1]); // Default to Amy Winehouse
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const [revealedPercent, setRevealedPercent] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const isDrawing = useRef(false);

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
    decay: number;
  }
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset game state
    setRevealedPercent(0);
    setIsWon(false);

    // Fill with slate background (dark textured stone)
    ctx.fillStyle = '#1e1e20';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some organic slate vein lines
    ctx.strokeStyle = '#2b2b2f';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, 0);
      ctx.lineTo(Math.random() * canvas.width, canvas.height);
      ctx.stroke();
    }
    
    // Add slate horizontal micro-veins
    ctx.strokeStyle = '#151517';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y + (Math.random() * 20 - 10));
      ctx.stroke();
    }
  };

  useEffect(() => {
    initCanvas();
  }, [selectedArt]);

  useEffect(() => {
    const pCanvas = particleCanvasRef.current;
    if (!pCanvas) return;
    const pCtx = pCanvas.getContext('2d');
    if (!pCtx) return;

    pCanvas.width = 450;
    pCanvas.height = 562;

    const updateParticles = () => {
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      const activeParticles = particles.current;
      
      for (let i = activeParticles.length - 1; i >= 0; i--) {
        const p = activeParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity force
        p.vx *= 0.98; // friction
        p.life -= p.decay;

        if (p.life <= 0 || p.x < 0 || p.x > pCanvas.width || p.y > pCanvas.height) {
          activeParticles.splice(i, 1);
          continue;
        }

        // Draw primary slate chip/dust particle
        pCtx.fillStyle = `rgba(140, 140, 145, ${p.life})`;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fill();

        // Secondary lighter ambient dust trail
        pCtx.fillStyle = `rgba(180, 180, 185, ${p.life * 0.4})`;
        pCtx.beginPath();
        pCtx.arc(p.x - p.vx * 0.5, p.y - p.vy * 0.5, p.size * 0.7, 0, Math.PI * 2);
        pCtx.fill();
      }

      animationFrameId.current = requestAnimationFrame(updateParticles);
    };

    updateParticles();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const scratch = (pos: { x: number; y: number } | null) => {
    if (!pos || isWon) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 35, 0, Math.PI * 2);
    ctx.fill();

    // Spawn 4 slate carving particles per scratch stroke
    for (let i = 0; i < 4; i++) {
      particles.current.push({
        x: pos.x,
        y: pos.y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 3 - 1.5, // burst outwards/upwards
        size: Math.random() * 2.5 + 1.2,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02
      });
    }

    // Check revealed percentage
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    for (let i = 3; i < imgData.length; i += 4) {
      if (imgData[i] === 0) cleared++;
    }
    
    const percent = Math.round((cleared / (imgData.length / 4)) * 100);
    setRevealedPercent(percent);

    if (percent > 85) {
      setIsWon(true);
      // Fade out the rest of the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    scratch(getMousePos(e));
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    scratch(getMousePos(e));
  };

  const handleEnd = () => {
    isDrawing.current = false;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-12 w-full max-w-5xl">
      {/* Sidebar - Art List */}
      <div className="flex flex-col w-full lg:w-1/3 gap-4 order-2 lg:order-1">
        <h3 className="text-xl font-serif text-primary tracking-wider uppercase mb-2">Escoge una obra</h3>
        <div className="max-h-[300px] overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin border-r border-white/5">
          {artworks.map((art) => (
            <button
              key={art.title}
              onClick={() => setSelectedArt(art)}
              className={`p-3 text-left font-sans text-xs tracking-wider uppercase border rounded-sm transition-all duration-300 ${
                selectedArt.title === art.title
                  ? 'border-primary/40 text-primary bg-primary/5'
                  : 'border-white/5 text-foreground/40 hover:text-foreground/80 hover:border-white/10'
              }`}
            >
              {art.title}
            </button>
          ))}
        </div>
        
        <div className="mt-6 p-4 rounded-sm border border-white/5 bg-black">
          <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/30 block mb-1">Cincelado</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-serif font-light text-foreground">{revealedPercent}%</span>
            <span className="text-[10px] text-primary tracking-widest uppercase">Meta: 85%</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${Math.min(revealedPercent, 100)}%` }}
            />
          </div>
        </div>

        <button 
          onClick={initCanvas}
          className="mt-2 py-3 border border-white/10 hover:border-primary/30 hover:text-primary transition-all duration-500 uppercase tracking-widest text-[9px] font-sans rounded-sm cursor-pointer"
        >
          Reiniciar Pizarra
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex flex-col items-center justify-center w-full lg:w-2/3 order-1 lg:order-2">
        <div className="text-center mb-6">
          <h4 className="text-2xl font-serif font-light text-foreground uppercase tracking-wide">
            {selectedArt.title}
          </h4>
          <span className="text-[9px] tracking-[0.3em] uppercase text-primary/70 mt-1 block">
            Cincela con el ratón o dedo para revelar el lienzo
          </span>
        </div>

        <div className="relative w-full max-w-[450px] aspect-[4/5] bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 rounded-sm overflow-hidden select-none">
          {/* Base Artwork Image (Underneath) */}
          <div className="absolute inset-0 z-0">
            <Image
              src={`https://naroa.online/assets/${selectedArt.src}`}
              alt={selectedArt.title}
              fill
              className="object-cover"
              sizes="450px"
              quality={100}
            />
          </div>

          {/* Slate Scratch Canvas */}
          <canvas
            ref={canvasRef}
            width={450}
            height={562}
            className="absolute inset-0 z-10 cursor-crosshair touch-none mix-blend-normal"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />

          {/* Slate Dust Particle Physics Layer */}
          <canvas
            ref={particleCanvasRef}
            className="absolute inset-0 z-20 pointer-events-none"
          />

          {/* Victory overlay */}
          {isWon && (
            <div className="absolute inset-0 bg-[#0A0A0Ad8] z-30 flex flex-col justify-center items-center p-8 text-center animate-[fadeIn_0.8s_ease-out]">
              <span className="text-primary font-hand text-5xl rotate-6 mb-2">Espectacular</span>
              <h5 className="text-2xl font-serif uppercase tracking-widest text-foreground font-light mb-4">
                Obra Revelada
              </h5>
              <p className="text-xs text-foreground/50 max-w-[280px] leading-relaxed mb-6">
                Has retirado la pizarra para liberar los colores y el alma del retrato hiperrealista.
              </p>
              <button
                onClick={initCanvas}
                className="px-6 py-3 bg-primary text-black hover:bg-white transition-colors duration-500 font-sans text-[10px] tracking-[0.2em] uppercase rounded-sm font-semibold cursor-pointer"
              >
                Cincelar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
