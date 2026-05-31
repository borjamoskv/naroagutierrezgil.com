import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from 'remotion';
import volumeEnvelope from './volume_envelope_acto3.json';

// ============================================================
// GON Y EL INTERVALO PROHIBIDO — ACTO III: EL ORIGEN DEL RUIDO
// SOBERANO EDITION — Industrial Noir 2026
// ============================================================

const C = {
  bg: '#0A0A0A',
  accent: '#2B3BE5',
  accentGlow: '#4D5FFF',
  pardo: '#6B4226',
  pardoGlow: '#8B5A2B',
  cream: '#E8DCC8',
  red: '#C41E3A',
  redGlow: '#FF2244',
  gold: '#B8860B',
  white: '#F0EDE8',
  dim: '#1A1A2E',
  green: '#22CC66',
  greenGlow: '#44FF88',
};

// === DETERMINISTIC PRNG ===
function prng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// === AGENT DATA ===
interface Agent {
  id: number; x: number; y: number; vx: number; vy: number;
  size: number; phase: number; speed: number;
  type: 'sax' | 'cuenca' | 'larguero' | 'fujur' | 'gato' | 'normal' | 'espinete';
}

function generateAgents(n: number): Agent[] {
  const r = prng(9090);
  const agents: Agent[] = [];
  for (let i = 0; i < n; i++) {
    const type: Agent['type'] =
      i < 150 ? 'sax' :
      i < 300 ? 'cuenca' :
      i < 400 ? 'larguero' :
      i < 420 ? 'fujur' :
      i < 440 ? 'gato' :
      i === 441 ? 'espinete' : 'normal';
    agents.push({
      id: i, x: r() * 1920, y: r() * 1080,
      vx: (r() - 0.5) * 2.5, vy: (r() - 0.5) * 2.5,
      size: type === 'espinete' ? 32 :
            type === 'fujur' ? 3 + r() * 4 :
            type === 'sax' ? 2 + r() * 2.5 :
            type === 'cuenca' ? 2 + r() * 2 :
            type === 'gato' ? 1.5 + r() * 1 :
            0.8 + r() * 1.8,
      phase: r() * Math.PI * 2,
      speed: 0.4 + r() * 1.6,
      type,
    });
  }
  return agents;
}

// === SCENE PHASES ===
type Phase = 'granvia_inert' | 'ramonc_costumbre' | 'gon_atraviesa' | 'ramonc_desajuste' | 
  'omega_liturgical_glitch' | 'subsuelo_core' | 'ramonc_negotiation' | 'legacy_mind' | 
  'analog_umbral' | 'final';

function getPhase(s: number): Phase {
  if (s < 8.5) return 'granvia_inert';
  if (s < 14.5) return 'ramonc_costumbre';
  if (s < 20.0) return 'gon_atraviesa';
  if (s < 25.0) return 'ramonc_desajuste';
  if (s < 31.5) return 'omega_liturgical_glitch';
  if (s < 38.5) return 'subsuelo_core';
  if (s < 43.5) return 'ramonc_negotiation';
  if (s < 50.5) return 'legacy_mind';
  if (s < 60.0) return 'analog_umbral';
  return 'final';
}

// === SUBTITLES ===
interface Sub { s: number; e: number; text: string; who?: string; sz?: number; shake?: boolean; }

import subsActo3 from './subtitles_acto3.json';
const SUBS = subsActo3 as Sub[];

const AgentField: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sec = frame / fps;
  const phase = getPhase(sec);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Background vignette
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height) / 1.2);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.75, 'transparent');
    gradient.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const volume = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;

    // Shockwave rings
    if (volume > 0.08) {
      const ringCount = 2;
      for (let rIndex = 0; rIndex < ringCount; rIndex++) {
        const progress = ((frame * 0.4 + rIndex * 20) % 40) / 40;
        const radius = progress * 800 * (0.35 + volume * 0.65);
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = phase === 'omega_liturgical_glitch' ? `rgba(77, 95, 255, ${0.4 * (1 - progress)})` :
                          phase === 'subsuelo_core' ? `rgba(196, 30, 58, ${0.45 * (1 - progress)})` :
                          `rgba(43, 59, 229, ${0.3 * (1 - progress)})`;
        ctx.lineWidth = 1 + volume * 6;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Connective mesh lines
    if (phase === 'omega_liturgical_glitch' || phase === 'legacy_mind' || phase === 'subsuelo_core') {
      const specials = agents.filter(a => a.type !== 'normal').slice(0, 90);
      ctx.lineWidth = 0.5;
      for (let i = 0; i < specials.length - 1; i += 2) {
        const a1 = specials[i];
        const a2 = specials[i + 1];
        const [x1, y1] = getAgentPos(a1, sec, frame, phase);
        const [x2, y2] = getAgentPos(a2, sec, frame, phase);
        const dist = Math.hypot(x2 - x1, y2 - y1);
        if (dist < 280) {
          const op = Math.max(0, 0.22 - dist / 1500);
          ctx.strokeStyle = phase === 'subsuelo_core' ? `rgba(196, 30, 58, ${op})` : `rgba(77, 95, 255, ${op})`;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    // Drawing the background isometric grid for legacy_mind
    if (phase === 'legacy_mind') {
      ctx.save();
      ctx.strokeStyle = 'rgba(77, 95, 255, 0.1)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let xG = 0; xG < width; xG += gridSize) {
        ctx.beginPath();
        ctx.moveTo(xG, 0);
        ctx.lineTo(xG, height);
        ctx.stroke();
      }
      for (let yG = 0; yG < height; yG += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, yG);
        ctx.lineTo(width, yG);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw the biological core node in subsuelo_core
    if (phase === 'subsuelo_core' || phase === 'ramonc_negotiation') {
      ctx.save();
      const coreRadius = 90 + Math.sin(frame * 0.1) * 15 + volume * 40;
      const pulseGlow = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, coreRadius + 60);
      pulseGlow.addColorStop(0, 'rgba(196, 30, 58, 0.8)');
      pulseGlow.addColorStop(0.5, 'rgba(196, 30, 58, 0.3)');
      pulseGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = pulseGlow;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, coreRadius + 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw rotating isometric umbral cube in analog_umbral
    if (phase === 'analog_umbral') {
      ctx.save();
      const cx = width / 2;
      const cy = height / 2;
      const scaleAmt = 120 + Math.sin(frame * 0.05) * 15 + volume * 30;
      const rotateAngle = frame * 0.02;

      // Project 3D cube coordinates to 2D
      const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
      ];

      const rotateY = (pt: number[], angle: number) => {
        const [xV, yV, zV] = pt;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        return [xV * cosA - zV * sinA, yV, xV * sinA + zV * cosA];
      };

      const rotateX = (pt: number[], angle: number) => {
        const [xV, yV, zV] = pt;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        return [xV, yV * cosA - zV * sinA, yV * sinA + zV * cosA];
      };

      const projected = vertices.map(v => {
        const r1 = rotateY(v, rotateAngle);
        const r2 = rotateX(r1, rotateAngle * 0.7);
        // Simple orthographic projection
        return [cx + r2[0] * scaleAmt, cy + r2[1] * scaleAmt];
      });

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // Back face
        [4, 5], [5, 6], [6, 7], [7, 4], // Front face
        [0, 4], [1, 5], [2, 6], [3, 7]  // Connectors
      ];

      ctx.strokeStyle = `rgba(77, 95, 255, ${0.45 + volume * 0.45})`;
      ctx.lineWidth = 2 + volume * 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = C.accentGlow;

      edges.forEach(([i1, i2]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i1][0], projected[i1][1]);
        ctx.lineTo(projected[i2][0], projected[i2][1]);
        ctx.stroke();
      });
      ctx.restore();
    }

    // Render agents
    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const [x, y, r, opacity, color, glow] = getAgentRender(a, sec, frame, phase);
      
      if (opacity < 0.02 || x < -50 || x > width + 50 || y < -50 || y > height + 50) continue;
      
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      
      if (glow) {
        ctx.shadowBlur = (a.type === 'fujur' ? 12 : a.type === 'sax' ? 8 : 6) * (1 + volume * 2);
        ctx.shadowColor = color;
      }
      
      if (a.type === 'espinete') {
        // Draw Espinete in thong
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#FF69B4';
        ctx.fill();
        
        ctx.strokeStyle = '#FF1493';
        ctx.lineWidth = 3;
        const spikeCount = 21;
        for (let s = 0; s < spikeCount; s++) {
          const sAngle = (s / spikeCount) * Math.PI * 2 + frame * 0.05;
          const sLen = r + 15 + Math.sin(frame * 0.5 + s) * 8;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(sAngle) * r, y + Math.sin(sAngle) * r);
          ctx.lineTo(x + Math.cos(sAngle) * sLen, y + Math.sin(sAngle) * sLen);
          ctx.stroke();
        }
        
        ctx.fillStyle = C.pardo;
        ctx.beginPath();
        ctx.moveTo(x - 12, y + r - 8);
        ctx.lineTo(x + 12, y + r - 8);
        ctx.lineTo(x, y + r + 18);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = C.pardo;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, r - 4, 0.25 * Math.PI, 0.75 * Math.PI);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }, [frame, agents, fps, width, height, sec, phase]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  );
};

function getAgentPos(a: Agent, sec: number, frame: number, phase: Phase): [number, number] {
  const volume = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;
  const t = sec * a.speed + a.phase;
  const kick = volume * 15;
  let x = a.x + Math.sin(t * 0.3) * 35 + a.vx * frame * 0.065 + a.vx * kick;
  let y = a.y + Math.cos(t * 0.25 + 0.6) * 30 + a.vy * frame * 0.065 + a.vy * kick;
  x = ((x % 1920) + 1920) % 1920;
  y = ((y % 1080) + 1080) % 1080;

  switch (phase) {
    case 'granvia_inert': {
      // Grid lock (frozen digital infrastructure)
      const gx = Math.floor(a.x / 160) * 160 + 80;
      const gy = Math.floor(a.y / 135) * 135 + 67;
      const b = interpolate(sec, [0, 5], [0, 0.9], { extrapolateRight: 'clamp' });
      x = x * (1 - b) + gx * b;
      y = y * (1 - b) + gy * b;
      break;
    }
    case 'gon_atraviesa': {
      // Radial ring alignment from center
      const angle = a.phase;
      const targetDist = 200 + (a.id % 600);
      const b = interpolate(sec, [14.5, 17.5], [0, 0.85], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      x = x * (1 - b) + (960 + Math.cos(angle) * targetDist) * b;
      y = y * (1 - b) + (540 + Math.sin(angle) * targetDist * 0.8) * b;
      break;
    }
    case 'ramonc_desajuste': {
      // Violent vibration (de-alignment)
      const jitter = Math.sin(frame * 1.5 + a.id) * 30 * (0.5 + volume * 1.5);
      x += jitter;
      y += jitter;
      break;
    }
    case 'subsuelo_core':
    case 'ramonc_negotiation': {
      // Connect to the biological core center
      const b = interpolate(sec, [31.5, 36.5], [0, 0.95], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      x = x * (1 - b) + 960 * b;
      y = y * (1 - b) + 540 * b;
      break;
    }
    case 'analog_umbral': {
      // Spiral swirling down into the center cube
      const swirlSpeed = sec * 3 + a.phase;
      const spiralRad = 800 * (1 - (sec - 50.5) / 9.5);
      const b = interpolate(sec, [50.5, 59.0], [0, 0.99], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      x = x * (1 - b) + (960 + Math.cos(swirlSpeed) * spiralRad) * b;
      y = y * (1 - b) + (540 + Math.sin(swirlSpeed) * spiralRad * 0.6) * b;
      break;
    }
  }
  return [x, y];
}

function getAgentRender(a: Agent, sec: number, frame: number, phase: Phase): [number, number, number, number, string, boolean] {
  const volume = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;
  const [x, y] = getAgentPos(a, sec, frame, phase);
  let r = a.size * (a.type === 'normal' ? 1 + volume * 0.6 : 1 + volume * 1.5);
  let opacity = 0.45;
  let glow = false;

  let color: string;
  switch (a.type) {
    case 'sax': color = C.accent; glow = true; break;
    case 'cuenca': color = C.pardo; break;
    case 'larguero': color = C.red; break;
    case 'fujur': color = C.cream; glow = true; break;
    case 'gato': color = C.green; break;
    case 'espinete': color = '#FF69B4'; glow = true; break;
    default: color = C.dim;
  }

  switch (phase) {
    case 'granvia_inert':
      opacity = a.type !== 'normal' ? 0.6 : 0.15;
      color = C.dim;
      break;
    case 'ramonc_costumbre':
      opacity = a.type === 'cuenca' ? 0.95 : 0.2;
      color = C.gold;
      r = a.size * 0.8;
      break;
    case 'gon_atraviesa':
      opacity = 0.85;
      glow = true;
      color = C.accentGlow;
      break;
    case 'ramonc_desajuste':
      opacity = 0.75;
      color = a.id % 2 === 0 ? C.pardoGlow : C.gold;
      break;
    case 'omega_liturgical_glitch':
      opacity = 0.8;
      color = a.id % 3 === 0 ? C.accentGlow : a.id % 3 === 1 ? C.greenGlow : C.dim;
      glow = a.id % 3 !== 2;
      break;
    case 'subsuelo_core':
      opacity = 0.9;
      color = C.redGlow;
      glow = true;
      break;
    case 'legacy_mind':
      opacity = 0.8;
      color = C.accentGlow;
      glow = true;
      break;
    case 'analog_umbral':
      opacity = interpolate(sec, [50.5, 59.0], [0.95, 0], { extrapolateRight: 'clamp' });
      color = C.cream;
      break;
    case 'final':
      opacity = 0;
      break;
  }

  return [x, y, r, opacity, color, glow];
}

const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const current = SUBS.find(s => sec >= s.s && sec < s.e);
  if (!current) return null;

  const fadeIn = interpolate(sec, [current.s, current.s + 0.25], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(sec, [current.e - 0.4, current.e], [1, 0], { extrapolateRight: 'clamp' });
  const opacity = fadeIn * fadeOut;

  const fontSize = current.sz || 32;
  const shake = current.shake ? Math.sin(frame * 2.5) * 6 : 0;
  const shakeY = current.shake ? Math.cos(frame * 3.1) * 5 : 0;

  const speakerColor: Record<string, string> = {
    GON: C.accent,
    RAMONCÍN: C.gold,
    'SOVEREIGN OMEGA': C.accentGlow,
  };
  const color = current.who ? (speakerColor[current.who] || C.white) : C.white;

  return (
    <div style={{
      position: 'absolute', bottom: 100, left: 0, right: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity, transform: `translate(${shake}px, ${shakeY}px)`,
    }}>
      {current.who && (
        <div style={{
          color, fontSize: 16, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 10,
          opacity: 0.6, borderBottom: `1px solid ${color}33`, paddingBottom: 4,
        }}>
          ▸ {current.who}
        </div>
      )}
      <div style={{
        color, fontSize, fontFamily: "'Outfit', sans-serif",
        fontWeight: fontSize > 44 ? 800 : fontSize > 36 ? 600 : 400,
        textAlign: 'center', lineHeight: 1.35, maxWidth: 1500,
        padding: '24px 60px',
        background: 'rgba(10, 10, 10, 0.85)',
        borderRadius: 12, whiteSpace: 'pre-line',
        textShadow: `0 0 30px ${color}44, 0 2px 10px rgba(0,0,0,0.9)`,
        border: '1px solid rgba(43, 59, 229, 0.25)',
        backdropFilter: 'blur(15px)',
      }}>
        {current.text}
      </div>
    </div>
  );
};

const FreqViz: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const phase = getPhase(sec);
  
  const currentVol = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;

  const bars = useMemo(() => {
    const n = 160;
    const result: React.ReactNode[] = [];
    for (let i = 0; i < n; i++) {
      const f = (i / n) * Math.PI * 8;
      const osc = Math.sin(frame * 0.15 + f) * 0.35 +
                  Math.sin(frame * 0.08 - f * 2) * 0.25 +
                  Math.cos(frame * 0.3 + f * 1.5) * 0.15 + 0.5;
                  
      const height = (currentVol * 160 * osc) + 2;
      const color = phase === 'subsuelo_core' ? C.red :
                    phase === 'omega_liturgical_glitch' ? C.greenGlow :
                    phase === 'legacy_mind' ? C.accentGlow :
                    C.accent;
      
      result.push(
        <div key={i} style={{
          width: 1920 / n - 1, height,
          background: `linear-gradient(to top, ${color}, ${color}44)`,
          opacity: 0.2 + currentVol * 0.8,
          borderRadius: '2px 2px 0 0',
        }} />
      );
    }
    return result;
  }, [frame, currentVol, phase]);

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 180,
      display: 'flex', alignItems: 'flex-end', gap: 1,
    }}>
      {bars}
    </div>
  );
};

const ScreenEffects: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const phase = getPhase(sec);

  // Blackout static flash for Scene 15
  const staticFlash = (sec > 58.5 && sec < 60.0) ? 
    interpolate(sec, [58.5, 59.0, 60.0], [0, 0.95, 0], { extrapolateRight: 'clamp' }) : 0;

  return (
    <>
      {staticFlash > 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: `rgba(200, 200, 255, ${staticFlash})`,
          mixBlendMode: 'screen',
        }} />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)',
        pointerEvents: 'none',
      }} />
    </>
  );
};

const HUD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const phase = getPhase(sec);
  
  const hudOpacity = interpolate(sec, [2, 5, 55, 59], [0, 0.35, 0.35, 0], { extrapolateRight: 'clamp' });

  return (
    <>
      <div style={{
        position: 'absolute', top: 28, left: 36,
        color: C.accent, fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
        opacity: hudOpacity, letterSpacing: '0.1em',
      }}>
        GRAN-VIA-NODE // TELEFONICA // C5-REAL
      </div>
      <div style={{
        position: 'absolute', top: 28, right: 36,
        color: C.red, fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
        opacity: hudOpacity, letterSpacing: '0.1em',
      }}>
        LEGACY_SYSTEM ACTIVE
      </div>
      <div style={{
        position: 'absolute', top: 50, left: 36,
        color: '#555', fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
        opacity: hudOpacity * 0.7,
      }}>
        {phase.toUpperCase().replace('_', ' ')} · {sec.toFixed(1)}s
      </div>
      {(phase === 'legacy_mind' || phase === 'analog_umbral') && (
        <div style={{
          position: 'absolute', top: 50, right: 36,
          color: C.accentGlow, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
          opacity: 0.6 + Math.sin(frame * 0.3) * 0.4,
        }}>
          ◉ DECOUPLED DEEP LAYER DETECTED
        </div>
      )}
    </>
  );
};

export const GonAgentsActo3: React.FC = () => {
  const agents = useMemo(() => generateAgents(11000), []);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const phase = getPhase(sec);

  const currentVol = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;

  let shakeAmt = currentVol * 15;
  if (phase === 'ramonc_desajuste') {
    shakeAmt += 6;
  }
  if (phase === 'analog_umbral' && sec > 50.5 && sec < 58.0) {
    shakeAmt += 12 * interpolate(sec, [50.5, 51.5, 58.0], [1, 0.4, 0], { extrapolateRight: 'clamp' });
  }
  const shakeX = Math.sin(frame * 3.5) * shakeAmt;
  const shakeY = Math.cos(frame * 4.2) * shakeAmt;

  const scale = 1 + currentVol * 0.02;

  const bgColor =
    phase === 'omega_liturgical_glitch' ? '#060614' :
    phase === 'subsuelo_core' ? '#140508' :
    phase === 'analog_umbral' ? '#000000' :
    C.bg;

  const globalOp = interpolate(sec, [0, 0.5, 58, 60], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      backgroundColor: bgColor, opacity: globalOp,
      transform: `scale(${scale}) translate(${shakeX}px, ${shakeY}px)`,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Outfit:wght@100..900&display=swap');
      `}</style>
      <AgentField agents={agents} />
      <ScreenEffects />
      <FreqViz />
      <Subtitles />
      <HUD />
      <Audio src={staticFile('friccion_acto3_dialogs.wav')} />
      {/* Analog film grain overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: 0.03,
        pointerEvents: 'none',
        zIndex: 99,
      }} />
    </AbsoluteFill>
  );
};
