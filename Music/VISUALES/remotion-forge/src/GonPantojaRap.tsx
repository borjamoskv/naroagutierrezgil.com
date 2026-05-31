import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from 'remotion';
import volumeEnvelope from './volume_envelope_rap.json';
import subsRap from './subtitles_rap.json';

// Declare reality level
console.log("REALITY LEVEL: C5-REAL (Overwriting visualizer component with improved assets)");

const C = {
  bg: '#050508',
  gonBlue: '#2B3BE5',
  gonGlow: '#4D5FFF',
  pantojaRed: '#FF2244',
  pantojaGlow: '#FF5577',
  djGold: '#B8860B',
  djGlow: '#FFD700',
  white: '#F0EDE8',
  dim: '#14141E',
  grid: '#1A1A26',
};

// === DETERMINISTIC PRNG ===
function prng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// === AGENT DATA ===
interface Agent {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  speed: number;
  side: 'left' | 'right' | 'center';
}

function generateAgents(n: number): Agent[] {
  const r = prng(42);
  const agents: Agent[] = [];
  for (let i = 0; i < n; i++) {
    const side = i % 3 === 0 ? 'left' : i % 3 === 1 ? 'right' : 'center';
    agents.push({
      id: i,
      x: r() * 1920,
      y: r() * 1080,
      vx: (r() - 0.5) * 4.5,
      vy: (r() - 0.5) * 4.5,
      size: 0.8 + r() * 2.8,
      phase: r() * Math.PI * 2,
      speed: 0.5 + r() * 1.8,
      side,
    });
  }
  return agents;
}

// === SUBTITLES INTERFACE ===
interface Sub {
  s: number;
  e: number;
  text: string;
  who?: string;
  sz?: number;
  shake?: boolean;
}
const SUBS = subsRap as Sub[];

// === HEALTH CALCULATION ENGINE ===
const getHealth = (sec: number) => {
  let gonHealth = 100;
  let panHealth = 100;
  
  if (sec < 9.7) {
    // Intro
    gonHealth = 100;
    panHealth = 100;
  } else if (sec >= 9.7 && sec < 79.4) {
    // Gon's round: damages Pantoja
    gonHealth = 100;
    panHealth = interpolate(sec, [9.7, 79.4], [100, 70]);
  } else if (sec >= 79.4 && sec < 114.8) {
    // Pantoja's round: damages Gon
    gonHealth = interpolate(sec, [79.4, 114.8], [100, 60]);
    panHealth = 70;
  } else if (sec >= 114.8 && sec < 162.9) {
    // Gon's final round: KOs Pantoja
    gonHealth = 60;
    panHealth = interpolate(sec, [114.8, 161.0], [70, 0], { extrapolateRight: 'clamp' });
  } else {
    // Outro
    gonHealth = 60;
    panHealth = 0;
  }
  return { gonHealth, panHealth };
};

// === AGENT FIELD CANVAS RENDERER ===
const AgentField: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sec = frame / fps;

  // Find active speaker from subtitle
  const activeSub = SUBS.find(s => sec >= s.s && sec < s.e);
  const activeSpeaker = activeSub ? activeSub.who : null;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fluid trail rendering: instead of clearRect, we draw a semi-transparent black rectangle
    const trailOpacity = activeSpeaker ? 0.3 : 0.15;
    ctx.fillStyle = `rgba(5, 5, 8, ${trailOpacity})`;
    ctx.fillRect(0, 0, width, height);

    const volume = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;

    // Draw cyber perspective grid in background
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    const gridCount = 20;
    const gridYStart = height * 0.4;
    
    // Draw perspective lines from horizon center
    const horizonX = width / 2;
    const horizonY = height * 0.45;
    
    ctx.save();
    ctx.globalAlpha = 0.25 + volume * 0.15;
    for (let i = 0; i <= gridCount; i++) {
      const x = (i / gridCount) * width;
      ctx.beginPath();
      ctx.moveTo(horizonX, horizonY);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    // Draw horizontal grid lines that compress towards horizon
    for (let j = 0; j < 10; j++) {
      const progress = j / 9;
      const y = horizonY + progress * (height - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // Draw central reactive shields
    if (activeSpeaker === 'GON') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(width * 0.25, height * 0.45, 140 + volume * 180, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(43, 59, 229, ${0.15 + volume * 0.45})`;
      ctx.lineWidth = 3 + volume * 10;
      ctx.stroke();
      ctx.restore();
    } else if (activeSpeaker === 'ISABEL PANTOJA') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(width * 0.75, height * 0.45, 140 + volume * 180, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 34, 68, ${0.15 + volume * 0.45})`;
      ctx.lineWidth = 3 + volume * 10;
      ctx.stroke();
      ctx.restore();
    }

    // Connect particles on active side
    const connectionColor = activeSpeaker === 'GON' ? `rgba(43, 59, 229, 0.15)` :
                             activeSpeaker === 'ISABEL PANTOJA' ? `rgba(255, 34, 68, 0.15)` :
                             `rgba(184, 134, 11, 0.1)`;

    ctx.strokeStyle = connectionColor;
    ctx.lineWidth = 0.6;
    
    const activeAgents = agents.filter(a => {
      if (activeSpeaker === 'GON') return a.side === 'left';
      if (activeSpeaker === 'ISABEL PANTOJA') return a.side === 'right';
      return a.side === 'center';
    }).slice(0, 45);

    for (let i = 0; i < activeAgents.length - 1; i++) {
      const a1 = activeAgents[i];
      const a2 = activeAgents[i+1];
      const [x1, y1] = getAgentPos(a1, sec, frame, activeSpeaker, volume);
      const [x2, y2] = getAgentPos(a2, sec, frame, activeSpeaker, volume);
      const dist = Math.hypot(x2 - x1, y2 - y1);
      if (dist < 260) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // Render agents using dynamic Batching
    const batches: Record<string, { color: string; glow: boolean; opacity: number; points: [number, number, number][] }> = {};

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const [x, y, r, opacity, color, glow] = getAgentRender(a, sec, frame, activeSpeaker, volume);
      
      if (opacity < 0.02 || x < -50 || x > width + 50 || y < -50 || y > height + 50) continue;

      const opKey = Math.round(opacity * 10) / 10;
      const key = `${color}|${glow ? '1' : '0'}|${opKey}`;
      
      if (!batches[key]) {
        batches[key] = {
          color,
          glow,
          opacity: opKey,
          points: []
        };
      }
      batches[key].points.push([x, y, r]);
    }

    const keys = Object.keys(batches);
    for (let k = 0; k < keys.length; k++) {
      const b = batches[keys[k]];
      ctx.save();
      ctx.globalAlpha = b.opacity;
      ctx.fillStyle = b.color;
      
      if (b.glow) {
        ctx.shadowBlur = 8 * (1 + volume * 1.8);
        ctx.shadowColor = b.color;
      }
      
      ctx.beginPath();
      for (let p = 0; p < b.points.length; p++) {
        const [px, py, pr] = b.points[p];
        ctx.moveTo(px + pr, py);
        ctx.arc(px, py, pr, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    }

    // System glitch scanner lines when volume is high
    if (volume > 0.65 && frame % 3 === 0) {
      ctx.save();
      const glitchY = prng(frame)() * height;
      ctx.strokeStyle = activeSpeaker === 'GON' ? `rgba(77, 95, 255, 0.4)` : `rgba(255, 85, 119, 0.4)`;
      ctx.lineWidth = 1 + prng(frame + 1)() * 4;
      ctx.beginPath();
      ctx.moveTo(0, glitchY);
      ctx.lineTo(width, glitchY);
      ctx.stroke();
      ctx.restore();
    }
  }, [frame, agents, fps, width, height, sec, activeSpeaker]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  );
};

// === DYNAMIC AGENT POSITION ===
function getAgentPos(a: Agent, sec: number, frame: number, activeSpeaker: string | null, volume: number): [number, number] {
  const t = sec * a.speed + a.phase;
  const kick = volume * 18;
  
  let targetX = a.x + Math.sin(t * 0.35) * 45 + a.vx * frame * 0.05 + a.vx * kick;
  let targetY = a.y + Math.cos(t * 0.22 + 0.4) * 40 + a.vy * frame * 0.05 + a.vy * kick;

  targetX = ((targetX % 1920) + 1920) % 1920;
  targetY = ((targetY % 1080) + 1080) % 1080;

  if (activeSpeaker === 'GON') {
    const factor = interpolate(volume, [0, 1], [0.03, 0.2]);
    if (a.side === 'left') {
      targetX = targetX * (1 - factor) + (1920 * 0.25 + Math.sin(t) * 140) * factor;
      targetY = targetY * (1 - factor) + (1080 * 0.45 + Math.cos(t) * 140) * factor;
    }
  } else if (activeSpeaker === 'ISABEL PANTOJA') {
    const factor = interpolate(volume, [0, 1], [0.03, 0.2]);
    if (a.side === 'right') {
      targetX = targetX * (1 - factor) + (1920 * 0.75 + Math.sin(t) * 140) * factor;
      targetY = targetY * (1 - factor) + (1080 * 0.45 + Math.cos(t) * 140) * factor;
    }
  } else if (activeSpeaker === 'DJ') {
    const factor = 0.09 * (1 + volume * 0.3);
    const angle = t * 1.8;
    const rad = 280 + Math.sin(frame * 0.06 + a.phase) * 100;
    const cx = 1920 / 2 + Math.cos(angle) * rad;
    const cy = 1080 / 2 + Math.sin(angle) * rad * 0.55;
    targetX = targetX * (1 - factor) + cx * factor;
    targetY = targetY * (1 - factor) + cy * factor;
  }

  return [targetX, targetY];
}

// === DYNAMIC AGENT STYLING ===
function getAgentRender(a: Agent, sec: number, frame: number, activeSpeaker: string | null, volume: number): [number, number, number, number, string, boolean] {
  const [x, y] = getAgentPos(a, sec, frame, activeSpeaker, volume);
  let r = a.size * (1 + volume * 0.75);
  let opacity = 0.35;
  let glow = false;
  let color = C.dim;

  if (activeSpeaker === 'GON') {
    if (a.side === 'left') {
      color = C.gonBlue;
      glow = true;
      opacity = 0.95;
      r *= 1.5;
    } else {
      opacity = 0.12;
    }
  } else if (activeSpeaker === 'ISABEL PANTOJA') {
    if (a.side === 'right') {
      color = C.pantojaRed;
      glow = true;
      opacity = 0.95;
      r *= 1.5;
    } else {
      opacity = 0.12;
    }
  } else if (activeSpeaker === 'DJ') {
    color = C.djGold;
    glow = true;
    opacity = 0.8;
    r *= 1.3;
  } else {
    opacity = 0.3;
    color = a.side === 'left' ? C.gonBlue : a.side === 'right' ? C.pantojaRed : C.djGold;
  }

  return [x, y, r, opacity, color, glow];
}

// === SUBTITLES OVERLAY ===
const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const current = SUBS.find(s => sec >= s.s && sec < s.e);
  if (!current) return null;

  const fadeIn = interpolate(sec, [current.s, current.s + 0.15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(sec, [current.e - 0.25, current.e], [1, 0], { extrapolateRight: 'clamp' });
  const opacity = fadeIn * fadeOut;

  const fontSize = current.sz || 32;
  const shake = current.shake ? Math.sin(frame * 3.5) * 8 : 0;
  const shakeY = current.shake ? Math.cos(frame * 4.0) * 6 : 0;

  const speakerColor: Record<string, string> = {
    GON: C.gonBlue,
    'ISABEL PANTOJA': C.pantojaRed,
    DJ: C.djGold,
  };
  const color = current.who ? (speakerColor[current.who] || C.white) : C.white;

  return (
    <div style={{
      position: 'absolute', bottom: 120, left: 0, right: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity, transform: `translate(${shake}px, ${shakeY}px)`,
    }}>
      {current.who && (
        <div style={{
          color, fontSize: 16, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 12,
          opacity: 0.8, borderBottom: `1px solid ${color}44`, paddingBottom: 4,
        }}>
          ▸ {current.who}
        </div>
      )}
      <div style={{
        color, fontSize, fontFamily: "'Outfit', sans-serif",
        fontWeight: fontSize > 33 ? 800 : 500,
        textAlign: 'center', lineHeight: 1.4, maxWidth: 1400,
        padding: '24px 50px',
        background: 'rgba(6, 6, 10, 0.95)',
        borderRadius: 16, whiteSpace: 'pre-line',
        textShadow: `0 0 35px ${color}55, 0 3px 12px rgba(0,0,0,0.95)`,
        border: `1px solid ${color}44`,
        backdropFilter: 'blur(25px)',
      }}>
        {current.text}
      </div>
    </div>
  );
};

// === AUDIO FREQUENCY VISUALIZER ===
const FreqViz: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  
  const currentVol = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;
  const activeSub = SUBS.find(s => sec >= s.s && sec < s.e);
  const activeSpeaker = activeSub ? activeSub.who : null;

  const bars = useMemo(() => {
    const n = 120;
    const result: React.ReactNode[] = [];
    for (let i = 0; i < n; i++) {
      const f = (i / n) * Math.PI * 6;
      const osc = Math.sin(frame * 0.18 + f) * 0.4 +
                  Math.sin(frame * 0.07 - f * 1.5) * 0.2 + 0.4;
                  
      const height = (currentVol * 240 * osc) + 3;
      const color = activeSpeaker === 'GON' ? C.gonBlue :
                    activeSpeaker === 'ISABEL PANTOJA' ? C.pantojaRed :
                    activeSpeaker === 'DJ' ? C.djGlow :
                    C.dim;
      
      result.push(
        <div key={i} style={{
          width: 1920 / n - 2, height,
          background: `linear-gradient(to top, ${color}, ${color}22)`,
          opacity: 0.25 + currentVol * 0.75,
          borderRadius: '3px 3px 0 0',
          boxShadow: currentVol > 0.3 ? `0 0 15px ${color}33` : 'none',
        }} />
      );
    }
    return result;
  }, [frame, currentVol, activeSpeaker]);

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 260,
      display: 'flex', alignItems: 'flex-end', gap: 2,
    }}>
      {bars}
    </div>
  );
};

// === HUD & HEALTH BARS ===
const HUD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const currentVol = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;

  const { gonHealth, panHealth } = getHealth(sec);

  const activeSub = SUBS.find(s => sec >= s.s && sec < s.e);
  const activeSpeaker = activeSub ? activeSub.who : 'IDLE';

  const durationInSeconds = durationInFrames / fps;
  const hudOpacity = interpolate(sec, [0, 1.5, durationInSeconds - 2.0, durationInSeconds - 0.5], [0, 0.5, 0.5, 0], { extrapolateRight: 'clamp' });

  return (
    <div style={{ opacity: hudOpacity }}>
      {/* Top Left info */}
      <div style={{
        position: 'absolute', top: 32, left: 40,
        color: C.gonBlue, fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.12em',
      }}>
        MERCADILLO GANG · 1,000 AGENTS · C5-REAL
      </div>
      {/* Top Right info */}
      <div style={{
        position: 'absolute', top: 32, right: 40,
        color: C.pantojaRed, fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.12em',
        textAlign: 'right',
      }}>
        PANTOJA SHIELD: {activeSpeaker === 'ISABEL PANTOJA' ? 'ENGAGED' : 'STANDBY'}
      </div>
      {/* Dynamic Sub-HUD */}
      <div style={{
        position: 'absolute', top: 56, left: 40,
        color: '#666', fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
      }}>
        BPM: 85 · ACTIVE SPEAKER: {activeSpeaker} · TIME: {sec.toFixed(2)}s / {durationInSeconds.toFixed(1)}s
      </div>

      {/* ARCADE FIGHTER HEALTH BARS */}
      <div style={{
        position: 'absolute', top: 36, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 20, width: 850,
      }}>
        {/* GON HEALTH */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
          <div style={{
            color: C.gonGlow, fontSize: 16, fontFamily: "'Outfit', sans-serif",
            fontWeight: 900, letterSpacing: '0.15em', marginBottom: 4,
            textShadow: `0 0 10px ${C.gonBlue}`,
          }}>
            GON
          </div>
          <div style={{
            width: '100%', height: 18, backgroundColor: '#111',
            border: '2px solid #222', borderRadius: 4, overflow: 'hidden',
            boxShadow: `0 0 15px rgba(43, 59, 229, 0.1)`,
            transform: 'scaleX(-1)' // Fills from right to left
          }}>
            <div style={{
              width: `${gonHealth}%`, height: '100%',
              backgroundColor: C.gonBlue,
              boxShadow: `0 0 12px ${C.gonGlow}`,
              transition: 'width 0.2s ease-out',
            }} />
          </div>
        </div>

        {/* VS LOGO */}
        <div style={{
          color: activeSpeaker === 'DJ' ? C.djGlow : C.white,
          fontSize: 22, fontFamily: "'Outfit', sans-serif", fontWeight: 900,
          border: `2px solid ${activeSpeaker === 'DJ' ? C.djGold : '#333'}`,
          borderRadius: '50%', padding: '6px 12px',
          background: '#08080C',
          boxShadow: `0 0 15px rgba(255,255,255,0.05)`,
        }}>
          VS
        </div>

        {/* PANTOJA HEALTH */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
          <div style={{
            color: C.pantojaGlow, fontSize: 16, fontFamily: "'Outfit', sans-serif",
            fontWeight: 900, letterSpacing: '0.15em', marginBottom: 4,
            textShadow: `0 0 10px ${C.pantojaRed}`,
          }}>
            PANTOJA
          </div>
          <div style={{
            width: '100%', height: 18, backgroundColor: '#111',
            border: '2px solid #222', borderRadius: 4, overflow: 'hidden',
            boxShadow: `0 0 15px rgba(255, 34, 68, 0.1)`,
          }}>
            <div style={{
              width: `${panHealth}%`, height: '100%',
              backgroundColor: C.pantojaRed,
              boxShadow: `0 0 12px ${C.pantojaGlow}`,
              transition: 'width 0.2s ease-out',
            }} />
          </div>
        </div>
      </div>

      {/* Central Background Title */}
      <div style={{
        position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)',
        color: 'rgba(255,255,255,0.02)', fontSize: 140, fontFamily: "'Outfit', sans-serif",
        fontWeight: 900, pointerEvents: 'none', userSelect: 'none',
        letterSpacing: '0.2em',
      }}>
        GON VS PANTOJA
      </div>
    </div>
  );
};

// === COMPOSITION MAIN COMPONENT ===
export const GonPantojaRap: React.FC = () => {
  const agents = useMemo(() => generateAgents(1000), []);
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const sec = frame / fps;

  const currentVol = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;
  
  // Find active speaker from subtitle
  const activeSub = SUBS.find(s => sec >= s.s && sec < s.e);
  const activeSpeaker = activeSub ? activeSub.who : null;

  // React-based screen shake
  let shakeAmt = currentVol * 14;
  if (activeSpeaker === 'ISABEL PANTOJA' && activeSub?.shake) {
    shakeAmt += 12;
  }
  const shakeX = Math.sin(frame * 4.0) * shakeAmt;
  const shakeY = Math.cos(frame * 4.5) * shakeAmt;

  const scale = 1 + currentVol * 0.018;

  const durationInSeconds = durationInFrames / fps;
  const globalOpacity = interpolate(sec, [0, 0.4, durationInSeconds - 1.5, durationInSeconds], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  // Dynamic split gradient background based on speaker focus
  const bgGradient = activeSpeaker === 'GON' 
    ? `radial-gradient(circle at 25% 45%, rgba(43, 59, 229, 0.06) 0%, ${C.bg} 65%)`
    : activeSpeaker === 'ISABEL PANTOJA'
    ? `radial-gradient(circle at 75% 45%, rgba(255, 34, 68, 0.06) 0%, ${C.bg} 65%)`
    : activeSpeaker === 'DJ'
    ? `radial-gradient(circle at 50% 45%, rgba(184, 134, 11, 0.04) 0%, ${C.bg} 60%)`
    : C.bg;

  return (
    <AbsoluteFill style={{
      background: bgGradient,
      opacity: globalOpacity,
      transform: `scale(${scale}) translate(${shakeX}px, ${shakeY}px)`,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&family=Outfit:wght@100..900&display=swap');
      `}</style>
      
      <AgentField agents={agents} />

      {/* AVATAR VECTOR OVERLAYS */}
      {/* GON AVATAR (LEFT SIDE) */}
      <div style={{
        position: 'absolute', top: '45%', left: '25%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: activeSpeaker === 'GON' ? 0.95 : 0.08,
        transition: 'opacity 0.25s ease-out',
        pointerEvents: 'none',
      }}>
        <svg width="240" height="240" viewBox="0 0 100 100" style={{ 
          filter: `drop-shadow(0 0 25px ${activeSpeaker === 'GON' ? C.gonGlow + '88' : 'transparent'})`,
          transform: `scale(${activeSpeaker === 'GON' ? 1 + currentVol * 0.15 : 1}) rotate(${activeSpeaker === 'GON' ? Math.sin(frame * 0.1) * 3 : 0}deg)`,
          transition: 'transform 0.1s ease-out',
        }}>
          {/* Cap Crown */}
          <path d="M20,60 C20,32 40,22 60,22 C80,22 85,37 85,57 L85,62 Z" fill="none" stroke={C.gonBlue} strokeWidth="3" />
          {/* Cap Visor */}
          <path d="M15,62 C10,62 5,65 5,70 C5,77 25,82 50,82 C70,82 85,75 85,62" fill="none" stroke={C.gonBlue} strokeWidth="3" />
          {/* Detail */}
          <circle cx="60" cy="22" r="3.5" fill={C.gonBlue} />
          {/* Text decoration */}
          <text x="36" y="52" fill={C.gonBlue} fontSize="13" fontFamily="'Outfit', sans-serif" fontWeight="900" letterSpacing="0.1em">GON</text>
        </svg>
      </div>

      {/* PANTOJA AVATAR (RIGHT SIDE) */}
      <div style={{
        position: 'absolute', top: '45%', left: '75%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: activeSpeaker === 'ISABEL PANTOJA' ? 0.95 : 0.08,
        transition: 'opacity 0.25s ease-out',
        pointerEvents: 'none',
      }}>
        <svg width="240" height="240" viewBox="0 0 100 100" style={{ 
          filter: `drop-shadow(0 0 25px ${activeSpeaker === 'ISABEL PANTOJA' ? C.pantojaGlow + '88' : 'transparent'})`,
          transform: `scale(${activeSpeaker === 'ISABEL PANTOJA' ? 1 + currentVol * 0.15 : 1}) rotate(${activeSpeaker === 'ISABEL PANTOJA' ? Math.cos(frame * 0.08) * 4 : 0}deg)`,
          transition: 'transform 0.1s ease-out',
        }}>
          {/* Fan radiating ribs */}
          <path d="M50,85 L18,40" stroke={C.pantojaRed} strokeWidth="2.5" />
          <path d="M50,85 L32,28" stroke={C.pantojaRed} strokeWidth="2.5" />
          <path d="M50,85 L50,22" stroke={C.pantojaRed} strokeWidth="2.5" />
          <path d="M50,85 L68,28" stroke={C.pantojaRed} strokeWidth="2.5" />
          <path d="M50,85 L82,40" stroke={C.pantojaRed} strokeWidth="2.5" />
          {/* Fan outer arch */}
          <path d="M14,45 C30,18 70,18 86,45" fill="none" stroke={C.pantojaRed} strokeWidth="4.5" />
          {/* Fan inner lace details */}
          <path d="M24,58 C35,42 65,42 76,58" fill="none" stroke={C.pantojaRed} strokeWidth="1.5" strokeDasharray="3,3" />
          <text x="32" y="80" fill={C.pantojaRed} fontSize="7" fontFamily="'Outfit', sans-serif" fontWeight="900" letterSpacing="0.05em">CANTORA</text>
        </svg>
      </div>
      
      {/* Background vignette & visual flashes */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.65) 100%)',
        pointerEvents: 'none',
      }} />

      {activeSpeaker === 'ISABEL PANTOJA' && currentVol > 0.45 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 75% 45%, rgba(255, 34, 68, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      {activeSpeaker === 'GON' && currentVol > 0.45 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 25% 45%, rgba(43, 59, 229, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      <FreqViz />
      <Subtitles />
      <HUD />
      <Audio src={staticFile('rap_battle_dialogs.wav')} />
      
      {/* Analog film grain overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: 0.035,
        pointerEvents: 'none',
        zIndex: 99,
      }} />
    </AbsoluteFill>
  );
};
