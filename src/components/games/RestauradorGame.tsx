'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function RestauradorGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [brushColor, setBrushColor] = useState<string>('#D4AF37'); // Gold Kintsugi
  const [brushSize, setBrushSize] = useState<number>(20);
  const [toolMode, setToolMode] = useState<'kintsugi' | 'acrylic' | 'mica' | 'eraser'>('kintsugi');
  const [damagePercent, setDamagePercent] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw initial baseline artwork (Slate & Portrait setup)
    resetCanvas();
  }, []);

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark Slate Background
    ctx.fillStyle = '#121214';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texture grid / slate cracks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + Math.random() * 20 - 10, canvas.height);
      ctx.stroke();
    }

    // Abstract portrait silhouette
    ctx.fillStyle = 'rgba(43, 59, 229, 0.15)';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2 - 20, 100, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (Naroa's signature ceramic gloss pupil style)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 35, canvas.height / 2 - 30, 12, 0, Math.PI * 2);
    ctx.arc(canvas.width / 2 + 35, canvas.height / 2 - 30, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2B3BE5';
    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 35, canvas.height / 2 - 30, 6, 0, Math.PI * 2);
    ctx.arc(canvas.width / 2 + 35, canvas.height / 2 - 30, 6, 0, Math.PI * 2);
    ctx.fill();

    // Text on canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ RESTAURACIÓN DE PIZARRA // CANTINFLOWERS & KINTSUGI ]', canvas.width / 2, canvas.height - 20);

    setDamagePercent(0);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (toolMode === 'kintsugi') {
      ctx.strokeStyle = '#D4AF37';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 10;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() * 6 - 3), y + (Math.random() * 6 - 3));
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (toolMode === 'acrylic') {
      ctx.fillStyle = brushColor;
      ctx.shadowBlur = 0;
      for (let i = 0; i < 5; i++) {
        const offsetX = (Math.random() - 0.5) * brushSize * 1.5;
        const offsetY = (Math.random() - 0.5) * brushSize * 1.5;
        const r = Math.random() * (brushSize / 3) + 2;
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (toolMode === 'mica') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (toolMode === 'eraser') {
      ctx.fillStyle = '#121214';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
    }

    setDamagePercent(prev => Math.min(100, prev + 0.4));
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'obra-restaurada-naroa.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0A0A0A] border border-white/10 rounded-lg p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-serif text-white tracking-wide flex items-center gap-2">
            <span className="text-[#2B3BE5]">👨‍🎨</span> El Restaurador Desastroso
          </h2>
          <p className="text-xs text-white/50 font-sans mt-1">
            Restaura o re-crea la obra con Kintsugi de Oro, Acrílicos y Escamas de Mica.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Intervención</span>
            <span className="text-sm font-mono text-[#2B3BE5] font-bold">{Math.round(damagePercent)}%</span>
          </div>
          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#2B3BE5] to-[#D4AF37] transition-all duration-300" 
              style={{ width: `${damagePercent}%` }} 
            />
          </div>
        </div>
      </div>

      {/* CANVAS DISPLAY */}
      <div className="relative w-full aspect-[4/3] bg-black rounded-md overflow-hidden border border-white/10 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          onMouseMove={draw}
          onTouchStart={() => setIsDrawing(true)}
          onTouchEnd={() => setIsDrawing(false)}
          onTouchMove={draw}
          className="w-full h-full object-contain cursor-crosshair touch-none"
        />
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        {/* MODES */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Técnica</span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => { setToolMode('kintsugi'); setBrushColor('#D4AF37'); }}
              className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors ${toolMode === 'kintsugi' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              ✨ Kintsugi
            </button>
            <button
              onClick={() => setToolMode('acrylic')}
              className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors ${toolMode === 'acrylic' ? 'bg-[#2B3BE5] text-white font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              🎨 Acrílico
            </button>
            <button
              onClick={() => setToolMode('mica')}
              className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors ${toolMode === 'mica' ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              💎 Mica
            </button>
            <button
              onClick={() => setToolMode('eraser')}
              className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors ${toolMode === 'eraser' ? 'bg-red-900/60 text-white font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              🧹 Limpiar
            </button>
          </div>
        </div>

        {/* COLORS (For Acrylic) */}
        {toolMode === 'acrylic' && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Pigmento</span>
            <div className="flex gap-2 items-center">
              {['#2B3BE5', '#E63946', '#FFB703', '#8338EC', '#00F5D4'].map(color => (
                <button
                  key={color}
                  onClick={() => setBrushColor(color)}
                  className={`w-6 h-6 rounded-full border border-white/20 transition-transform ${brushColor === color ? 'scale-125 border-white shadow-lg' : 'opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* BRUSH SIZE */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Grosor: {brushSize}px</span>
          <input
            type="range"
            min={5}
            max={50}
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
            className="w-full accent-[#2B3BE5] cursor-pointer"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 items-end justify-end">
          <button
            onClick={resetCanvas}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-sm transition-colors"
          >
            Reiniciar
          </button>
          <button
            onClick={downloadCanvas}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-[#2B3BE5] hover:bg-white hover:text-black text-white font-bold rounded-sm transition-colors shadow-lg"
          >
            Guardar Obra
          </button>
        </div>
      </div>
    </div>
  );
}
