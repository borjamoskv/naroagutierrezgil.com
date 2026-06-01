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
import subs from './subtitles_rap.json';
import audioFile from '../public/rap_battle_dialogs.wav';

const CaptainAmerica: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // Fly across the screen slowly over time, wrapping around.
  const xPos = ((frame * 6) % (width + 1000)) - 500;
  // Bobbing up and down
  const yPos = height * 0.15 + Math.sin(frame * 0.05) * 150;

  return (
    <div style={{
      position: 'absolute',
      left: xPos,
      top: yPos,
      transform: `rotate(${Math.sin(frame * 0.1) * 15}deg)`,
      opacity: 0.6,
      zIndex: 5,
    }}>
      <svg width="150" height="150" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))' }}>
        <circle cx="50" cy="50" r="45" fill="#E23636" />
        <circle cx="50" cy="50" r="35" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="25" fill="#E23636" />
        <circle cx="50" cy="50" r="15" fill="#0033A0" />
        <polygon points="50,38 53,46 62,46 55,51 58,60 50,55 42,60 45,51 38,46 47,46" fill="#FFFFFF" />
        <path d="M 35 25 C 35 10, 65 10, 65 25 C 65 40, 50 45, 50 45 C 50 45, 35 40, 35 25 Z" fill="#0033A0" />
        <text x="50" y="25" fill="#FFFFFF" fontSize="12" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">A</text>
        <rect x="42" y="28" width="16" height="8" fill="#FAD6B1" rx="4" />
        <circle cx="46" cy="32" r="2" fill="#000" />
        <circle cx="54" cy="32" r="2" fill="#000" />
        <path d="M 35 20 L 20 10 L 35 25 Z" fill="#FFFFFF" />
        <path d="M 65 20 L 80 10 L 65 25 Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

// Declare reality level
console.log("REALITY LEVEL: C5-REAL (Overwriting component with flashing headlights & Double K.O. banner)");

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
const SUBS = subs as Sub[];

// === HEALTH CALCULATION ENGINE ===
const getHealth = (sec: number) => {
  let gonHealth = 100;
  let panHealth = 100;
  
  if (sec < 9.7) {
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
  } else if (sec >= 114.8 && sec < 151.11) {
    // Gon's second round: damages Pantoja further
    gonHealth = 60;
    panHealth = interpolate(sec, [114.8, 151.11], [70, 40]);
  } else if (sec >= 151.11 && sec < 195.76) {
    // El Pirri arrives, Gon gets distracted
    gonHealth = 60;
    panHealth = 40;
  } else if (sec >= 195.76 && sec < 224.82) {
    // Ramoncín and Stoichkov enter
    gonHealth = 60;
    panHealth = 40;
  } else if (sec >= 224.82 && sec < 236.47) {
    // Stoichkov stamps on Gon's foot! Gon takes critical damage
    gonHealth = interpolate(sec, [224.82, 236.47], [60, 5], { extrapolateRight: 'clamp' });
    panHealth = 40;
  } else if (sec >= 236.47 && sec < 271.85) {
    // Gon is down. Pantoja argues.
    gonHealth = 5;
    panHealth = 40;
  } else if (sec >= 271.85 && sec < 280.11) {
    // Stoichkov stamps on Pantoja's bata de cola! Pantoja takes critical damage
    gonHealth = 5;
    panHealth = interpolate(sec, [271.85, 280.11], [40, 0], { extrapolateRight: 'clamp' });
  } else {
    // Both K.O.'d by Stoichkov's Toledan stomps!
    gonHealth = 0;
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

    // Fluid trail rendering
    const trailOpacity = activeSpeaker === 'EL PIRRI' ? 0.35 : 
                         activeSpeaker === 'STOICHKOV' ? 0.4 :
                         activeSpeaker === 'RAMONCÍN' ? 0.08 :
                         activeSpeaker ? 0.28 : 0.15;

    ctx.fillStyle = `rgba(5, 5, 8, ${trailOpacity})`;
    ctx.fillRect(0, 0, width, height);

    const volume = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;

    // Draw cyber perspective grid in background
    ctx.strokeStyle = activeSpeaker === 'EL PIRRI' ? `rgba(184, 134, 11, 0.12)` : 
                      activeSpeaker === 'RAMONCÍN' ? `rgba(184, 134, 11, 0.25)` :
                      activeSpeaker === 'STOICHKOV' ? `rgba(255, 34, 68, 0.18)` :
                      C.grid;
    ctx.lineWidth = 1;
    const gridCount = 20;
    
    // Draw perspective lines from horizon center
    const horizonX = width / 2;
    const horizonY = height * 0.45;
    
    ctx.save();
    ctx.globalAlpha = activeSpeaker === 'EL PIRRI' ? 0.45 + volume * 0.2 : 0.25 + volume * 0.15;
    for (let i = 0; i <= gridCount; i++) {
      const x = (i / gridCount) * width;
      ctx.beginPath();
      ctx.moveTo(horizonX, horizonY);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    // Draw horizontal grid lines
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
    } else if (activeSpeaker === 'EL PIRRI') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, height * 0.45, 160 + volume * 220, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(184, 134, 11, ${0.25 + volume * 0.5})`;
      ctx.lineWidth = 4 + volume * 12;
      ctx.stroke();
      ctx.restore();
    } else if (activeSpeaker === 'RAMONCÍN') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, height * 0.45, 150 + volume * 100, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(184, 134, 11, ${0.4 + volume * 0.3})`;
      ctx.lineWidth = 6 + volume * 8;
      ctx.stroke();
      ctx.restore();
    } else if (activeSpeaker === 'STOICHKOV') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, height * 0.45, 180 + volume * 250, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 34, 68, ${0.3 + volume * 0.5})`;
      ctx.lineWidth = 5 + volume * 15;
      ctx.stroke();
      ctx.restore();
    }

    // Connect particles on active side
    const connectionColor = activeSpeaker === 'GON' ? `rgba(43, 59, 229, 0.15)` :
                             activeSpeaker === 'ISABEL PANTOJA' ? `rgba(255, 34, 68, 0.15)` :
                             activeSpeaker === 'EL PIRRI' ? `rgba(184, 134, 11, 0.22)` :
                             activeSpeaker === 'RAMONCÍN' ? `rgba(184, 134, 11, 0.35)` :
                             activeSpeaker === 'STOICHKOV' ? `rgba(255, 34, 68, 0.28)` :
                             `rgba(184, 134, 11, 0.1)`;

    ctx.strokeStyle = connectionColor;
    ctx.lineWidth = 0.6;
    
    const activeAgents = agents.filter(a => {
      if (activeSpeaker === 'GON') return a.side === 'left';
      if (activeSpeaker === 'ISABEL PANTOJA') return a.side === 'right';
      return true;
    }).slice(0, activeSpeaker === 'EL PIRRI' || activeSpeaker === 'STOICHKOV' ? 60 : 45);

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

    // Render agents using Batching
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

    // Glitch scanlines on high volume / Stoichkov rage
    if ((volume > 0.65 || activeSpeaker === 'STOICHKOV') && frame % 3 === 0) {
      ctx.save();
      const glitchY = prng(frame)() * height;
      ctx.strokeStyle = activeSpeaker === 'GON' ? `rgba(77, 95, 255, 0.4)` :
                        activeSpeaker === 'ISABEL PANTOJA' ? `rgba(255, 85, 119, 0.4)` :
                        activeSpeaker === 'STOICHKOV' ? `rgba(255, 0, 0, 0.5)` :
                        `rgba(255, 215, 0, 0.35)`;
      ctx.lineWidth = 1 + prng(frame + 1)() * 6;
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
  } else if (activeSpeaker === 'EL PIRRI') {
    const factor = 0.15 * (1 + volume * 0.4);
    const angle = t * 3.8 + a.id * 0.04;
    const rad = 180 + Math.sin(frame * 0.12 + a.phase) * 130;
    const cx = 1920 / 2 + Math.cos(angle) * rad;
    const cy = 1080 / 2 + Math.sin(angle) * rad * 0.55;
    targetX = targetX * (1 - factor) + cx * factor;
    targetY = targetY * (1 - factor) + cy * factor;
  } else if (activeSpeaker === 'RAMONCÍN') {
    const factor = 0.98;
    targetX = targetX * (1 - factor) + a.x * factor;
    targetY = targetY * (1 - factor) + a.y * factor;
  } else if (activeSpeaker === 'STOICHKOV') {
    const factor = interpolate(volume, [0, 1], [0.05, 0.35]);
    const stompDirection = a.id % 2 === 0 ? 1 : -1;
    targetX += a.vx * kick * 2.8 * stompDirection;
    targetY += a.vy * kick * 2.8 * stompDirection;
  } else if (activeSpeaker === 'DJ') {
    const factor = 0.09 * (1 + volume * 0.2);
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
  } else if (activeSpeaker === 'EL PIRRI') {
    color = C.djGold;
    glow = true;
    opacity = 0.9;
    r *= 1.6;
  } else if (activeSpeaker === 'RAMONCÍN') {
    color = C.djGold;
    glow = true;
    opacity = 0.95;
    r *= 1.4;
  } else if (activeSpeaker === 'STOICHKOV') {
    color = C.pantojaRed;
    glow = true;
    opacity = 0.98;
    r *= 1.7;
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

// === SUBTITLES OVERLAY — RIDICULOUSLY DISPROPORTIONATE ===
const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const current = SUBS.find(s => sec >= s.s && sec < s.e);
  if (!current) return null;

  const fadeIn = interpolate(sec, [current.s, current.s + 0.1], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(sec, [current.e - 0.2, current.e], [1, 0], { extrapolateRight: 'clamp' });
  const opacity = fadeIn * fadeOut;

  const currentVol = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;

  // Make the base font size huge and scale dynamically to the beat!
  const baseSize = current.who === 'EL PIRRI' ? 120 
                 : current.who === 'ISABEL PANTOJA' ? 110 
                 : current.who === 'GON' ? 95 
                 : current.who === 'STOICHKOV' ? 130
                 : current.who === 'RAMONCÍN' ? 115
                 : 80;
                 
  const fontSize = baseSize * (1.0 + currentVol * 0.95);
  
  const shake = current.shake ? Math.sin(frame * 4.0) * 12 : 0;
  const shakeY = current.shake ? Math.cos(frame * 4.6) * 10 : 0;

  const speakerColor: Record<string, string> = {
    GON: C.gonBlue,
    'ISABEL PANTOJA': C.pantojaRed,
    'EL PIRRI': C.djGlow,
    RAMONCÍN: C.djGold,
    STOICHKOV: C.pantojaRed,
    DJ: C.djGold,
  };
  const color = current.who ? (speakerColor[current.who] || C.white) : C.white;

  return (
    <div style={{
      position: 'absolute', top: '54%', left: 0, right: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity, transform: `translate(${shake}px, ${shakeY}px)`,
      pointerEvents: 'none',
      zIndex: 100,
    }}>
      {current.who && (
        <div style={{
          color, fontSize: 24, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 15,
          opacity: 0.9, borderBottom: `2px solid ${color}66`, paddingBottom: 6,
          fontWeight: 900,
          textShadow: `0 0 15px ${color}88`,
        }}>
          ▸ {current.who}
        </div>
      )}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Background Karaoke Layer (Dimmed) */}
        <div style={{
          color: 'transparent',
          WebkitTextStroke: `2px ${color}66`,
          fontSize, fontFamily: "'Outfit', sans-serif",
          fontWeight: 900, textAlign: 'center', lineHeight: 0.9, maxWidth: 1750,
          padding: '20px 40px', whiteSpace: 'pre-line', textTransform: 'uppercase',
          letterSpacing: '-0.05em', background: 'transparent',
        }}>
          {current.text}
        </div>
        {/* Foreground Karaoke Layer (Clipped) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          color, fontSize, fontFamily: "'Outfit', sans-serif",
          fontWeight: 900, textAlign: 'center', lineHeight: 0.9, maxWidth: 1750,
          padding: '20px 40px', whiteSpace: 'pre-line', textTransform: 'uppercase',
          letterSpacing: '-0.05em',
          textShadow: `0 0 30px rgba(0,0,0,1), 0 0 45px ${color}bb, 0 0 80px ${color}66`,
          clipPath: `polygon(0 0, ${Math.min(100, Math.max(0, ((sec - current.s) / (current.e - current.s)) * 100))}% 0, ${Math.min(100, Math.max(0, ((sec - current.s) / (current.e - current.s)) * 100))}% 100%, 0 100%)`,
        }}>
          {current.text}
        </div>
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
                    activeSpeaker === 'EL PIRRI' ? C.djGlow :
                    activeSpeaker === 'RAMONCÍN' ? C.djGold :
                    activeSpeaker === 'STOICHKOV' ? C.pantojaRed :
                    activeSpeaker === 'DJ' ? C.djGold :
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
            transform: 'scaleX(-1)'
          }}>
            <div style={{
              width: `${gonHealth}%`, height: '100%',
              backgroundColor: gonHealth < 30 && (frame % 10 < 5) ? '#FFF' : C.gonBlue,
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
  const agents = useMemo(() => generateAgents(10000), []);
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
    shakeAmt += 14;
  } else if (activeSpeaker === 'EL PIRRI') {
    shakeAmt += 15;
  } else if (activeSpeaker === 'STOICHKOV') {
    shakeAmt += 22; // Massive Stoichkov stomping shake!
  }
  const shakeX = Math.sin(frame * 4.0) * shakeAmt;
  const shakeY = Math.cos(frame * 4.5) * shakeAmt;

  const scale = 1 + currentVol * 0.02;

  const durationInSeconds = durationInFrames / fps;
  const globalOpacity = interpolate(sec, [0, 0.4, durationInSeconds - 1.5, durationInSeconds], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  // Dynamic split gradient background based on speaker focus
  const bgGradient = activeSpeaker === 'GON' 
    ? `radial-gradient(circle at 25% 45%, rgba(43, 59, 229, 0.07) 0%, ${C.bg} 65%)`
    : activeSpeaker === 'ISABEL PANTOJA'
    ? `radial-gradient(circle at 75% 45%, rgba(255, 34, 68, 0.07) 0%, ${C.bg} 65%)`
    : activeSpeaker === 'EL PIRRI'
    ? `radial-gradient(circle at 50% 45%, rgba(218, 165, 32, 0.09) 0%, ${C.bg} 60%)`
    : activeSpeaker === 'RAMONCÍN'
    ? `radial-gradient(circle at 50% 45%, rgba(184, 134, 11, 0.09) 0%, ${C.bg} 60%)`
    : activeSpeaker === 'STOICHKOV'
    ? `radial-gradient(circle at 50% 45%, rgba(255, 34, 68, 0.12) 0%, ${C.bg} 60%)`
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
        position: 'absolute', top: '45%', left: '22%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: activeSpeaker === 'GON' ? 0.95 : (activeSpeaker === 'EL PIRRI' || activeSpeaker === 'STOICHKOV' || activeSpeaker === 'RAMONCÍN') ? 0.02 : 0.08,
        transition: 'opacity 0.25s ease-out',
        pointerEvents: 'none',
      }}>
        <svg width="240" height="240" viewBox="0 0 100 100" style={{ 
          filter: `drop-shadow(0 0 25px ${activeSpeaker === 'GON' ? C.gonGlow + '88' : 'transparent'})`,
          transform: `scale(${activeSpeaker === 'GON' ? 1 + currentVol * 0.15 : 1}) rotate(${activeSpeaker === 'GON' ? Math.sin(frame * 0.1) * 3 : 0}deg)`,
          transition: 'transform 0.1s ease-out',
        }}>
          <path d="M20,60 C20,32 40,22 60,22 C80,22 85,37 85,57 L85,62 Z" fill="none" stroke={C.gonBlue} strokeWidth="3" />
          <path d="M15,62 C10,62 5,65 5,70 C5,77 25,82 50,82 C70,82 85,75 85,62" fill="none" stroke={C.gonBlue} strokeWidth="3" />
          <circle cx="60" cy="22" r="3.5" fill={C.gonBlue} />
          <text x="36" y="52" fill={C.gonBlue} fontSize="13" fontFamily="'Outfit', sans-serif" fontWeight="900" letterSpacing="0.1em">GON</text>
        </svg>
      </div>

      {/* PANTOJA AVATAR (RIGHT SIDE) */}
      <div style={{
        position: 'absolute', top: '45%', left: '78%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: activeSpeaker === 'ISABEL PANTOJA' ? 0.95 : (activeSpeaker === 'EL PIRRI' || activeSpeaker === 'STOICHKOV' || activeSpeaker === 'RAMONCÍN') ? 0.02 : 0.08,
        transition: 'opacity 0.25s ease-out',
        pointerEvents: 'none',
      }}>
        <svg width="240" height="240" viewBox="0 0 100 100" style={{ 
          filter: `drop-shadow(0 0 25px ${activeSpeaker === 'ISABEL PANTOJA' ? C.pantojaGlow + '88' : 'transparent'})`,
          transform: `scale(${activeSpeaker === 'ISABEL PANTOJA' ? 1 + currentVol * 0.15 : 1}) rotate(${activeSpeaker === 'ISABEL PANTOJA' ? Math.cos(frame * 0.08) * 4 : 0}deg)`,
          transition: 'transform 0.1s ease-out',
        }}>
          <path d="M50,85 L18,40" stroke={C.pantojaRed} strokeWidth="2.5" />
          <path d="M50,85 L32,28" stroke={C.pantojaRed} strokeWidth="2.5" />
          <path d="M50,85 L50,22" stroke={C.pantojaRed} strokeWidth="2.5" />
          <path d="M50,85 L68,28" stroke={C.pantojaRed} strokeWidth="2.5" />
          <path d="M50,85 L82,40" stroke={C.pantojaRed} strokeWidth="2.5" />
          <path d="M14,45 C30,18 70,18 86,45" fill="none" stroke={C.pantojaRed} strokeWidth="4.5" />
          <path d="M24,58 C35,42 65,42 76,58" fill="none" stroke={C.pantojaRed} strokeWidth="1.5" strokeDasharray="3,3" />
          <text x="32" y="80" fill={C.pantojaRed} fontSize="7" fontFamily="'Outfit', sans-serif" fontWeight="900" letterSpacing="0.05em">CANTORA</text>
        </svg>
      </div>

      {/* EL PIRRI CAR AVATAR WITH HEADLIGHT BEAMS */}
      <div style={{
        position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: activeSpeaker === 'EL PIRRI' ? 0.95 : 0.0,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: 'none',
        zIndex: 5,
      }}>
        <svg width="340" height="340" viewBox="0 0 100 100" style={{ 
          filter: `drop-shadow(0 0 35px ${C.djGlow})`,
          transform: `scale(${1 + currentVol * 0.22}) rotate(${activeSpeaker === 'EL PIRRI' ? Math.sin(frame * 0.35) * 8 : 0}deg)`,
          transition: 'transform 0.08s ease-out',
        }}>
          <circle cx="25" cy="70" r="10" fill="none" stroke={C.djGold} strokeWidth="3" />
          <circle cx="25" cy="70" r="4" fill={C.djGold} />
          <circle cx="75" cy="70" r="10" fill="none" stroke={C.djGold} strokeWidth="3" />
          <circle cx="75" cy="70" r="4" fill={C.djGold} />
          <path d="M5,60 L12,60 L18,45 L82,45 L88,60 L95,60 L95,70 L5,70 Z" fill="none" stroke={C.djGold} strokeWidth="3" />
          <path d="M22,45 L32,28 L68,28 L78,45 Z" fill="none" stroke={C.djGold} strokeWidth="3" />
          <line x1="50" y1="28" x2="50" y2="45" stroke={C.djGold} strokeWidth="2" />
          <text x="37" y="60" fill={C.djGold} fontSize="8" fontFamily="'Outfit', sans-serif" fontWeight="900">124</text>
          <text x="28" y="38" fill={C.djGlow} fontSize="6" fontFamily="'Outfit', sans-serif" fontWeight="900">PIRRI</text>
          
          {/* Headlights beams on beat */}
          <circle cx="15" cy="65" r="3.5" fill={currentVol > 0.3 ? C.djGlow : C.djGold} />
          <circle cx="85" cy="65" r="3.5" fill={currentVol > 0.3 ? C.djGlow : C.djGold} />
          {currentVol > 0.3 && (
            <>
              <polygon points="15,65 -60,180 15,180" fill="rgba(255, 230, 100, 0.22)" style={{ mixBlendMode: 'screen' }} />
              <polygon points="85,65 85,180 160,180" fill="rgba(255, 230, 100, 0.22)" style={{ mixBlendMode: 'screen' }} />
            </>
          )}
        </svg>
        <div style={{
          color: C.djGlow, fontSize: 18, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.25em', marginTop: 10, fontWeight: 900,
          textShadow: `0 0 15px ${C.djGold}`,
        }}>
          EL PIRRI (BREAKDANCING)
        </div>
      </div>

      {/* RAMONCÍN AVATAR */}
      <div style={{
        position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: activeSpeaker === 'RAMONCÍN' ? 0.95 : 0.0,
        transition: 'opacity 0.25s ease-in-out',
        pointerEvents: 'none',
        zIndex: 5,
      }}>
        <svg width="280" height="280" viewBox="0 0 100 100" style={{ 
          filter: `drop-shadow(0 0 35px ${C.djGlow})`,
          transform: `scale(${1 + currentVol * 0.2}) rotate(${Math.sin(frame * 0.15) * 5}deg)`,
        }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke={C.djGold} strokeWidth="5" />
          <text x="35" y="65" fill={C.djGold} fontSize="45" fontFamily="'Outfit', sans-serif" fontWeight="900">C</text>
        </svg>
        <div style={{
          color: C.djGold, fontSize: 18, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.2em', marginTop: 10, fontWeight: 900,
          textShadow: `0 0 15px ${C.djGold}`,
        }}>
          RAMONCÍN (SGAE ENFORCER)
        </div>
      </div>

      {/* STOICHKOV AVATAR WITH STOMPING COORDINATES */}
      <div style={{
        position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: activeSpeaker === 'STOICHKOV' ? 0.95 : 0.0,
        transition: 'opacity 0.25s ease-in-out',
        pointerEvents: 'none',
        zIndex: 5,
      }}>
        <svg width="280" height="280" viewBox="0 0 100 100" style={{ 
          filter: `drop-shadow(0 0 35px ${C.pantojaGlow})`,
          transform: `scale(${1 + currentVol * 0.25}) translateY(${activeSpeaker === 'STOICHKOV' ? Math.abs(Math.sin(frame * 0.4)) * -22 : 0}px)`,
        }}>
          <rect x="35" y="15" width="30" height="50" rx="3" fill={C.pantojaRed} stroke={C.pantojaGlow} strokeWidth="2" />
          <text x="41" y="48" fill={C.white} fontSize="22" fontFamily="'Outfit', sans-serif" fontWeight="900">8</text>
          <path d="M25,80 L75,80 L70,90 L30,90 Z" fill={C.dim} stroke={C.pantojaRed} strokeWidth="2" />
        </svg>
        <div style={{
          color: C.pantojaRed, fontSize: 18, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.2em', marginTop: 10, fontWeight: 900,
          textShadow: `0 0 15px ${C.pantojaRed}`,
        }}>
          HRISTO STOICHKOV (FROM TOLEDO)
        </div>
      </div>
      
      {/* WARNING BANNERS & CLIMAX OVERLAYS */}
      {/* SGAE WARNING */}
      {activeSpeaker === 'RAMONCÍN' && (
        <div style={{
          position: 'absolute', top: '14%', left: 0, right: 0,
          backgroundColor: 'rgba(184, 134, 11, 0.85)', color: '#000',
          fontFamily: "'JetBrains Mono', monospace", fontWeight: 900,
          fontSize: 22, padding: '10px 0', textAlign: 'center',
          letterSpacing: '0.3em', textTransform: 'uppercase',
          boxShadow: `0 0 30px ${C.djGold}`,
          zIndex: 200,
        }}>
          ⚠️ AVISO DE EMBARGO EJECUTIVO SGAE ⚠️
        </div>
      )}

      {/* STOICHKOV WARNING */}
      {activeSpeaker === 'STOICHKOV' && (
        <div style={{
          position: 'absolute', top: '14%', left: 0, right: 0,
          backgroundColor: 'rgba(255, 34, 68, 0.9)', color: '#fff',
          fontFamily: "'Outfit', sans-serif", fontWeight: 900,
          fontSize: 24, padding: '10px 0', textAlign: 'center',
          letterSpacing: '0.25em', textTransform: 'uppercase',
          boxShadow: `0 0 35px ${C.pantojaRed}`,
          zIndex: 200,
        }}>
          🔴 EXCLUSIÓN DIRECTA POR PISOTÓN BULGARO-TOLEDANO 🔴
        </div>
      )}

      {/* DOUBLE K.O. FINALE OVERLAY */}
      {sec >= 280.11 && (
        <div style={{
          position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          zIndex: 300, pointerEvents: 'none',
        }}>
          <div style={{
            color: C.pantojaRed, fontSize: 130, fontFamily: "'Outfit', sans-serif",
            fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
            textShadow: `0 0 40px ${C.pantojaGlow}, 0 0 80px ${C.pantojaRed}`,
            opacity: frame % 8 < 4 ? 1 : 0.2, // Neon strobe flash
          }}>
            DOUBLE K.O.
          </div>
          <div style={{
            color: C.djGold, fontSize: 32, fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 900, letterSpacing: '0.3em', marginTop: 10,
            textShadow: `0 0 20px ${C.djGold}`,
          }}>
            WINNER: SGAE & TOLEDO
          </div>
        </div>
      )}

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

      {activeSpeaker === 'EL PIRRI' && currentVol > 0.45 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 45%, rgba(184, 134, 11, 0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
      )}

      {activeSpeaker === 'STOICHKOV' && currentVol > 0.4 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 45%, rgba(255, 34, 68, 0.2) 0%, transparent 60%)',
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
