'use client';

import React, { useRef, useState, useEffect } from 'react';

interface KintsugiRepairProps {
  artworkTitle: string;
}

export const KintsugiRepair: React.FC<KintsugiRepairProps> = ({ artworkTitle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw initial dark slate texture base with cracked grey lines
    ctx.fillStyle = '#0F0F12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pre-cracked slate fissure paths
    ctx.strokeStyle = '#26262B';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(30, 20);
    ctx.lineTo(120, 90);
    ctx.lineTo(200, 60);
    ctx.lineTo(340, 160);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(80, 180);
    ctx.lineTo(160, 120);
    ctx.lineTo(280, 190);
    ctx.stroke();
  }, []);

  const drawGoldLine = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Gold 24K glowing stroke
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    setProgress((prev) => Math.min(100, prev + 1));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawGoldLine(x, y);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0F0F12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#26262B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, 20);
    ctx.lineTo(120, 90);
    ctx.lineTo(200, 60);
    ctx.lineTo(340, 160);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(80, 180);
    ctx.lineTo(160, 120);
    ctx.lineTo(280, 190);
    ctx.stroke();

    setProgress(0);
  };

  return (
    <div className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-6 my-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#F59E0B]">
            [ ALQUIMIA INTERACTIVA ]
          </span>
          <h4 className="text-lg font-serif text-white">
            Restauración Kintsugi en Oro 24K — {artworkTitle}
          </h4>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Arrastra el cursor sobre las vetas fracturadas de la losa para cicatrizarlas con hilo de oro fluido.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 text-neutral-300 rounded border border-white/10 transition"
        >
          Limpiar Losa
        </button>
      </div>

      <div className="relative w-full flex justify-center items-center bg-[#050507] rounded border border-white/5 py-4 overflow-hidden touch-none cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={380}
          height={220}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="rounded shadow-inner"
        />
        {progress > 80 && (
          <div className="absolute inset-0 bg-[#000]/75 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 animate-fade-in">
            <span className="text-2xl mb-2">✨</span>
            <h5 className="text-base font-serif text-[#F59E0B] tracking-wide">
              Losa Transmutada con Exito
            </h5>
            <p className="text-xs text-neutral-300 font-light max-w-xs mt-1">
              Las fisuras de la pizarra centenaria han sido preservadas en Oro de 24 Kilates.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 text-[10px] uppercase tracking-widest bg-[#F59E0B] text-black font-bold rounded"
            >
              Cicatrizar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KintsugiRepair;
