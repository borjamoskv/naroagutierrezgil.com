import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import subs from './subtitles_laundry.json';

const C = {
  bg: '#05050A',
  foam: '#E0F7FA',
  neonPink: '#FF007F',
  neonBlue: '#00F0FF',
  drum: '#222233'
};

function prng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface Bubble { x: number; y: number; r: number; speed: number; phase: number; }

const FoamField: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  const bubbles = useMemo(() => {
    const r = prng(99);
    const b: Bubble[] = [];
    for(let i=0; i<800; i++) {
      b.push({ x: r()*width, y: r()*height, r: 2 + r()*15, speed: 1 + r()*4, phase: r()*Math.PI*2 });
    }
    return b;
  }, [width, height]);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);

    // Draw giant washing machine drum
    const drumX = width / 2;
    const drumY = height / 2;
    ctx.save();
    ctx.translate(drumX, drumY);
    ctx.rotate(frame * 0.15);
    ctx.beginPath();
    ctx.arc(0, 0, 450, 0, Math.PI * 2);
    ctx.strokeStyle = C.neonBlue;
    ctx.lineWidth = 20;
    ctx.stroke();
    
    // Drum holes
    for(let i=0; i<12; i++) {
      const angle = (i/12) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle)*380, Math.sin(angle)*380, 40, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.fill();
      ctx.strokeStyle = C.neonBlue;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();

    // Draw bubbles
    ctx.fillStyle = C.foam;
    ctx.beginPath();
    bubbles.forEach(b => {
      let bx = b.x + Math.sin(frame * 0.05 + b.phase) * 20;
      let by = b.y - (frame * b.speed) % height;
      if (by < -50) by += height + 100;
      ctx.moveTo(bx + b.r, by);
      ctx.arc(bx, by, b.r, 0, Math.PI*2);
    });
    ctx.fill();

    // Strobe on beat
    if (frame % 15 < 3) {
      ctx.fillStyle = 'rgba(255, 0, 127, 0.15)';
      ctx.fillRect(0, 0, width, height);
    }
  }, [frame, width, height, bubbles]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute' }} />;
};

export const LaundryOrgy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const currentSub = (subs as any[]).find(s => sec >= s.s && sec < s.e);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <FoamField />
      
      {/* Neon Sign */}
      <div style={{
        position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
        color: C.neonPink, fontSize: 80, fontFamily: 'monospace', fontWeight: 900,
        textShadow: `0 0 20px ${C.neonPink}, 0 0 40px ${C.neonPink}`,
        letterSpacing: '0.2em', opacity: frame % 10 < 5 ? 1 : 0.8,
      }}>
        LAVANDERÍA 24H
      </div>

      {/* Subtitles */}
      {currentSub && (
        <div style={{
          position: 'absolute', top: '60%', left: '50%', transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: '80%',
        }}>
          <div style={{ color: C.neonBlue, fontSize: 40, fontFamily: 'monospace', marginBottom: 20, fontWeight: 'bold' }}>
            {currentSub.who}
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Background Karaoke Layer */}
            <div style={{
              color: 'transparent', WebkitTextStroke: `2px rgba(255, 255, 255, 0.4)`,
              fontSize: 120, fontFamily: 'sans-serif', fontWeight: 900,
              textAlign: 'center', textTransform: 'uppercase',
              transform: currentSub.who === 'GON' ? `rotate(${Math.sin(frame*0.5)*5}deg)` : 'none'
            }}>
              {currentSub.text}
            </div>
            {/* Foreground Karaoke Layer */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              color: '#FFF', fontSize: 120, fontFamily: 'sans-serif', fontWeight: 900,
              textAlign: 'center', textTransform: 'uppercase',
              textShadow: `0 0 30px #000, 4px 4px 0 ${C.neonPink}, -4px -4px 0 ${C.neonBlue}`,
              transform: currentSub.who === 'GON' ? `rotate(${Math.sin(frame*0.5)*5}deg)` : 'none',
              clipPath: `polygon(0 0, ${Math.min(100, Math.max(0, ((sec - currentSub.s) / (currentSub.e - currentSub.s)) * 100))}% 0, ${Math.min(100, Math.max(0, ((sec - currentSub.s) / (currentSub.e - currentSub.s)) * 100))}% 100%, 0 100%)`,
            }}>
              {currentSub.text}
            </div>
          </div>
        </div>
      )}
      <Audio src={staticFile('laundry_orgy.wav')} />
    </AbsoluteFill>
  );
};
