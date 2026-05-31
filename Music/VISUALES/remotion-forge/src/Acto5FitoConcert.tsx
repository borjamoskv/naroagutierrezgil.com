import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import subs from './subtitles_acto5.json';

const C = {
  bg: '#0F0F1A',
  fitoGorra: '#5A3E36', // Brownish flat cap
  fitoPiel: '#FAD6B1',
  neon: '#00F0FF',
  stageLights: '#FF007F'
};

function prng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface FitoFan { x: number; y: number; scale: number; phase: number; speed: number; }

const FitoCrowd: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  const fans = useMemo(() => {
    const r = prng(42);
    const f: FitoFan[] = [];
    // Generate 2000 Fitos
    for(let i=0; i<2000; i++) {
      // Concentrate them at the bottom half
      const x = r() * width;
      const y = (height * 0.5) + (r() * height * 0.6);
      // Perspective scale: lower Y = smaller, higher Y = larger (closer to camera)
      const scale = (y / height) * 1.5;
      f.push({ x, y, scale, phase: r()*Math.PI*2, speed: 0.2 + r()*0.5 });
    }
    // Sort by Y for proper z-indexing painting
    return f.sort((a,b) => a.y - b.y);
  }, [width, height]);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw fans
    fans.forEach(f => {
      // Bouncing effect based on frame and phase
      const bounce = Math.sin(frame * f.speed + f.phase) * (20 * f.scale);
      const fx = f.x;
      const fy = f.y - Math.abs(bounce); // Bouncing up

      ctx.save();
      ctx.translate(fx, fy);
      ctx.scale(f.scale, f.scale);

      // Draw Fito Face (simplified)
      // Head
      ctx.fillStyle = C.fitoPiel;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI*2);
      ctx.fill();
      // Sideburns
      ctx.fillStyle = '#000';
      ctx.fillRect(-15, -5, 5, 12);
      ctx.fillRect(10, -5, 5, 12);
      // Sunglasses
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-5, 0, 6, 0, Math.PI*2);
      ctx.arc(5, 0, 6, 0, Math.PI*2);
      ctx.fill();
      // Cap
      ctx.fillStyle = C.fitoGorra;
      ctx.beginPath();
      ctx.arc(0, -10, 16, Math.PI, 0);
      ctx.fill();
      // Cap brim
      ctx.fillRect(-18, -12, 36, 4);

      ctx.restore();
    });

    // Stage Lights (Strobe effect on the crowd)
    if (frame % 20 < 4) {
      ctx.fillStyle = 'rgba(255, 0, 127, 0.2)';
      ctx.fillRect(0, 0, width, height);
    }
  }, [frame, width, height, fans]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', bottom: 0 }} />;
};

export const Acto5FitoConcert: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const currentSub = (subs as any[]).find(s => sec >= s.s && sec < s.e);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      
      {/* Stage Background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
        background: `radial-gradient(circle at 50% 100%, ${C.stageLights} 0%, ${C.bg} 80%)`,
        zIndex: 0
      }} />

      {/* Main Stage Fito */}
      <div style={{
        position: 'absolute', left: '50%', top: '30%',
        transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame*0.2)*0.05})`,
        zIndex: 1
      }}>
        <svg width="300" height="400" viewBox="0 0 100 150" style={{ filter: 'drop-shadow(0 0 30px #FF007F)' }}>
          {/* Body */}
          <rect x="35" y="60" width="30" height="50" fill="#222" />
          {/* Guitar */}
          <ellipse cx="60" cy="90" rx="25" ry="15" fill="#B87333" transform="rotate(-30 60 90)" />
          <rect x="15" y="75" width="40" height="6" fill="#333" transform="rotate(-30 35 75)" />
          {/* Head */}
          <circle cx="50" cy="40" r="20" fill={C.fitoPiel} />
          {/* Sunglasses */}
          <circle cx="40" cy="38" r="7" fill="#000" />
          <circle cx="60" cy="38" r="7" fill="#000" />
          {/* Sideburns */}
          <rect x="28" y="30" width="6" height="15" fill="#000" />
          <rect x="66" y="30" width="6" height="15" fill="#000" />
          {/* Cap */}
          <path d="M 28 30 Q 50 10 72 30 Z" fill={C.fitoGorra} />
          <rect x="25" y="28" width="50" height="5" fill={C.fitoGorra} />
        </svg>
      </div>

      {/* Gon in Bikini with Saxophone */}
      <div style={{
        position: 'absolute', right: `${20 + Math.sin(frame * 0.1) * 5}%`, top: '40%',
        transform: `translate(50%, -50%) rotate(${Math.sin(frame * 0.2) * 10}deg) scale(1.5)`,
        zIndex: 2,
        opacity: frame > 60 ? 1 : 0,
        transition: 'opacity 0.5s'
      }}>
        <svg width="200" height="300" viewBox="0 0 100 150" style={{ filter: 'drop-shadow(0 0 20px #FF00FF)' }}>
          {/* Body */}
          <rect x="40" y="50" width="20" height="40" fill={C.fitoPiel} />
          {/* Bikini Top */}
          <circle cx="45" cy="60" r="6" fill="#FF1493" />
          <circle cx="55" cy="60" r="6" fill="#FF1493" />
          <path d="M 40 58 Q 50 50 60 58" stroke="#FF1493" strokeWidth="2" fill="none" />
          {/* Bikini Bottom */}
          <polygon points="40,85 50,95 60,85" fill="#FF1493" />
          {/* Head (Gon) */}
          <circle cx="50" cy="35" r="15" fill={C.fitoPiel} />
          {/* Super Saiyan Hair */}
          <polygon points="35,25 25,5 40,15 50,0 60,15 75,5 65,25" fill="#FFD700" />
          {/* Saxophone */}
          <path d="M 50 70 Q 30 70 30 100 Q 30 110 40 110 L 50 110 L 50 100 L 40 100 Q 35 100 35 90 Q 35 75 50 75 Z" fill="#FFD700" />
          <polygon points="50,105 60,95 60,115" fill="#FFD700" />
        </svg>
      </div>

      {/* Espinete and Doraemon (Couple) */}
      <div style={{
        position: 'absolute', left: `${15 + Math.cos(frame * 0.05) * 5}%`, top: '55%',
        transform: `translate(-50%, -50%) rotate(${Math.sin(frame * 0.1) * 5}deg) scale(1.3)`,
        zIndex: 3,
        opacity: frame > 100 ? 1 : 0,
        transition: 'opacity 0.5s'
      }}>
        <svg width="300" height="200" viewBox="0 0 150 100" style={{ filter: 'drop-shadow(0 0 15px rgba(255,100,100,0.8))' }}>
          {/* Heart between them */}
          <path d="M 75 35 A 5 5 0 0 0 65 35 A 5 5 0 0 0 75 45 A 5 5 0 0 0 85 35 A 5 5 0 0 0 75 35 Z" fill="#FF0000" transform={`scale(${1 + Math.sin(frame*0.2)*0.2})`} transform-origin="75 40" />
          
          {/* Espinete (Pink Hedgehog) */}
          <circle cx="40" cy="50" r="25" fill="#FF69B4" /> {/* Body */}
          <polygon points="40,25 35,15 45,15" fill="#FF69B4" /> {/* Spikes */}
          <polygon points="25,35 15,30 20,40" fill="#FF69B4" />
          <polygon points="55,35 65,30 60,40" fill="#FF69B4" />
          <circle cx="35" cy="45" r="3" fill="#000" /> {/* Eye */}
          <circle cx="45" cy="45" r="3" fill="#000" /> {/* Eye */}
          <path d="M 35 55 Q 40 60 45 55" stroke="#000" strokeWidth="2" fill="none" /> {/* Smile */}
          <circle cx="65" cy="65" r="5" fill="#FF69B4" /> {/* Hand holding Doraemon */}

          {/* Doraemon (Blue Cat Robot) */}
          <circle cx="110" cy="50" r="25" fill="#0096D6" /> {/* Body */}
          <circle cx="110" cy="55" r="20" fill="#FFF" /> {/* Belly/Face */}
          <circle cx="105" cy="40" r="4" fill="#FFF" stroke="#000" /> {/* Eye */}
          <circle cx="115" cy="40" r="4" fill="#FFF" stroke="#000" /> {/* Eye */}
          <circle cx="105" cy="40" r="1.5" fill="#000" />
          <circle cx="113" cy="40" r="1.5" fill="#000" />
          <circle cx="110" cy="47" r="3" fill="#F00" /> {/* Nose */}
          <path d="M 110 50 L 110 60" stroke="#000" strokeWidth="1" /> {/* Philtrum */}
          <path d="M 100 60 Q 110 68 120 60" stroke="#000" strokeWidth="1.5" fill="none" /> {/* Smile */}
          {/* Whiskers */}
          <line x1="90" y1="45" x2="100" y2="48" stroke="#000" />
          <line x1="90" y1="50" x2="100" y2="50" stroke="#000" />
          <line x1="90" y1="55" x2="100" y2="52" stroke="#000" />
          <line x1="130" y1="45" x2="120" y2="48" stroke="#000" />
          <line x1="130" y1="50" x2="120" y2="50" stroke="#000" />
          <line x1="130" y1="55" x2="120" y2="52" stroke="#000" />
          {/* Collar & Bell */}
          <path d="M 95 65 Q 110 70 125 65" stroke="#F00" strokeWidth="4" fill="none" />
          <circle cx="110" cy="68" r="4" fill="#FFD700" />
          {/* Pocket */}
          <path d="M 98 75 A 12 12 0 0 0 122 75 Z" fill="#FFF" stroke="#000" />
          <circle cx="85" cy="65" r="5" fill="#FFF" /> {/* Hand holding Espinete */}
        </svg>
      </div>

      <FitoCrowd />
      
      {/* Neon Sign */}
      <div style={{
        position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
        color: C.neon, fontSize: 80, fontFamily: 'monospace', fontWeight: 900,
        textShadow: `0 0 20px ${C.neon}, 0 0 40px ${C.neon}`,
        letterSpacing: '0.1em', opacity: frame % 10 < 5 ? 1 : 0.8,
        textAlign: 'center', zIndex: 10
      }}>
        SOLDADITO TRIBUNERO<br/>TOMA 14
      </div>

      {/* Subtitles Karaoke */}
      {currentSub && (
        <div style={{
          position: 'absolute', top: '75%', left: '50%', transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%', zIndex: 20
        }}>
          <div style={{ color: C.neon, fontSize: 40, fontFamily: 'monospace', marginBottom: 20, fontWeight: 'bold', backgroundColor: '#000A', padding: '5px 20px', borderRadius: 10 }}>
            {currentSub.who}
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              color: 'transparent', WebkitTextStroke: `3px rgba(255, 255, 255, 0.4)`,
              fontSize: 90, fontFamily: 'sans-serif', fontWeight: 900,
              textAlign: 'center', textTransform: 'uppercase', whiteSpace: 'pre-line'
            }}>
              {currentSub.text}
            </div>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              color: '#FFF', fontSize: 90, fontFamily: 'sans-serif', fontWeight: 900,
              textAlign: 'center', textTransform: 'uppercase', whiteSpace: 'pre-line',
              textShadow: `0 0 30px #000, 4px 4px 0 ${C.stageLights}`,
              clipPath: `polygon(0 0, ${Math.min(100, Math.max(0, ((sec - currentSub.s) / (currentSub.e - currentSub.s)) * 100))}% 0, ${Math.min(100, Math.max(0, ((sec - currentSub.s) / (currentSub.e - currentSub.s)) * 100))}% 100%, 0 100%)`,
            }}>
              {currentSub.text}
            </div>
          </div>
        </div>
      )}
      <Audio src={staticFile('acto5_fito_concert.wav')} />
    </AbsoluteFill>
  );
};
