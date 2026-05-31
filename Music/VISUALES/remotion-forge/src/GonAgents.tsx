import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from 'remotion';
import volumeEnvelope from './volume_envelope.json';

// ============================================================
// GON Y EL INTERVALO PROHIBIDO — 10,000 AGENTS
// INCREDIBLE EDITION — Industrial Noir 2026
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
  const r = prng(1337);
  const agents: Agent[] = [];
  for (let i = 0; i < n; i++) {
    const type: Agent['type'] =
      i < 120 ? 'sax' :
      i < 280 ? 'cuenca' :
      i < 350 ? 'larguero' :
      i < 370 ? 'fujur' :
      i < 380 ? 'gato' :
      i === 381 ? 'espinete' : 'normal';
    agents.push({
      id: i, x: r() * 1920, y: r() * 1080,
      vx: (r() - 0.5) * 3, vy: (r() - 0.5) * 3,
      size: type === 'espinete' ? 32 :
            type === 'fujur' ? 3 + r() * 4 :
            type === 'sax' ? 2 + r() * 2.5 :
            type === 'cuenca' ? 2 + r() * 2 :
            type === 'gato' ? 1.5 + r() * 1 :
            0.8 + r() * 1.8,
      phase: r() * Math.PI * 2,
      speed: 0.5 + r() * 1.5,
      type,
    });
  }
  return agents;
}

// === SCENE PHASES ===
type Phase = 'title' | 'intro' | 'copisteria' | 'flipar' | 'edo' | 'manolo' |
  'ertzaintza' | 'ramonc' | 'fujur' | 'espinete' | 'koldo' | 'ane' | 'ane_clonk' |
  'gato' | 'revelation' | 'pardo' | 'epilogue' | 'final';

function getPhase(s: number): Phase {
  if (s < 23.0) return 'intro';
  if (s < 56.0) return 'flipar';
  if (s < 89.0) return 'ertzaintza';
  if (s < 155.0) return 'ramonc';
  if (s < 186.0) return 'revelation';
  if (s < 200.0) return 'ane';
  if (s < 214.68) return 'epilogue';
  return 'final';
}

// === SUBTITLES ===
interface Sub { s: number; e: number; text: string; who?: string; sz?: number; shake?: boolean; }

import subsActo1 from './subtitles_acto1.json';
const SUBS = subsActo1 as Sub[];

// ============================================================
// AGENT RENDERER — 10,000 particles via HTML5 Canvas
// ============================================================
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

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background vignette
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height) / 1.2);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.7, 'transparent');
    gradient.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const volume = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;

    // Center reactive shockwave rings
    if (volume > 0.1) {
      const ringCount = 3;
      for (let rIndex = 0; rIndex < ringCount; rIndex++) {
        const progress = ((frame * 0.35 + rIndex * 15) % 45) / 45;
        const radius = progress * 700 * (0.4 + volume * 0.6);
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = phase === 'ane' || phase === 'ane_clonk' ? `rgba(196, 30, 58, ${0.35 * (1 - progress)})` :
                          phase === 'manolo' || phase === 'pardo' ? `rgba(107, 66, 38, ${0.35 * (1 - progress)})` :
                          `rgba(43, 59, 229, ${0.35 * (1 - progress)})`;
        ctx.lineWidth = 1 + volume * 8;
        ctx.stroke();
        ctx.restore();
      }
    }

    // === Connection lines for special agents ===
    if (phase === 'revelation' || phase === 'pardo' || phase === 'manolo') {
      const specials = agents.filter(a => a.type !== 'normal').slice(0, 60);
      ctx.lineWidth = 0.5;
      for (let i = 0; i < specials.length - 1; i += 2) {
        const a1 = specials[i];
        const a2 = specials[i + 1];
        const [x1, y1] = getAgentPos(a1, sec, frame, phase);
        const [x2, y2] = getAgentPos(a2, sec, frame, phase);
        const dist = Math.hypot(x2 - x1, y2 - y1);
        if (dist < 300) {
          const op = Math.max(0, 0.15 - dist / 2000);
          ctx.strokeStyle = `rgba(43, 59, 229, ${op})`; // C.accent
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    // === Render agents (Dynamic Batching for Max Exergy) ===
    const batches: Record<string, { color: string; glow: boolean; opacity: number; points: [number, number, number][] }> = {};

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const [x, y, r, opacity, color, glow] = getAgentRender(a, sec, frame, phase);
      
      if (opacity < 0.02 || x < -50 || x > width + 50 || y < -50 || y > height + 50) continue;
      
      if (a.type === 'espinete') {
        // Draw Espinete: a pink hedgehog in a thong!
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#FF69B4'; // Hot pink!
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#FF1493'; // Deep pink for spikes
        ctx.lineWidth = 3;
        const spikeCount = 21; // 21 EDO spikes!
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
        ctx.restore();
        continue;
      }

      // Group key: color + glow + rounded opacity (to 1 decimal place to bundle paths)
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

    // Render the batches
    const keys = Object.keys(batches);
    for (let k = 0; k < keys.length; k++) {
      const b = batches[keys[k]];
      ctx.save();
      ctx.globalAlpha = b.opacity;
      ctx.fillStyle = b.color;
      
      if (b.glow) {
        ctx.shadowBlur = 8 * (1 + volume * 2);
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
  const kick = volume * 18;
  let x = a.x + Math.sin(t * 0.3) * 40 + a.vx * frame * 0.08 + a.vx * kick;
  let y = a.y + Math.cos(t * 0.25 + 0.7) * 35 + a.vy * frame * 0.08 + a.vy * kick;
  x = ((x % 1920) + 1920) % 1920;
  y = ((y % 1080) + 1080) % 1080;

  switch (phase) {
    case 'title': {
      const b = interpolate(sec, [0, 3], [0, 0.7], { extrapolateRight: 'clamp' });
      x = x * (1 - b) + (960 + Math.cos(a.phase) * 250) * b;
      y = y * (1 - b) + (540 + Math.sin(a.phase) * 150) * b;
      break;
    }
    case 'copisteria': {
      const gx = (a.id % 120) * 16; const gy = Math.floor(a.id / 120) * 13;
      const b = interpolate(sec, [30, 38], [0, 0.6], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      const shake = volume * 5 * (a.id % 2 === 0 ? 1 : -1);
      x = x * (1 - b) + (gx + shake) * b; y = y * (1 - b) + (gy + shake) * b;
      break;
    }
    case 'flipar': {
      x += Math.sin(frame * 0.6 + a.id * 0.01) * 25;
      y += Math.cos(frame * 0.8 + a.id * 0.007) * 25;
      break;
    }
    case 'manolo': {
      const angle = (a.id / 10000) * Math.PI * 30 + sec * 0.4;
      const rad = (150 + (a.id % 600) * 0.8 + Math.sin(sec * 0.3 + a.phase) * 80) * (1 + volume * 0.15);
      const b = interpolate(sec, [92, 105], [0, 0.8], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      const sx = 960 + Math.cos(angle) * rad;
      const sy = 540 + Math.sin(angle) * rad * 0.7;
      x = x * (1 - b) + sx * b; y = y * (1 - b) + sy * b;
      break;
    }
    case 'ertzaintza': {
      const side = a.id % 2 === 0 ? -1 : 1;
      const b = interpolate(sec, [18.5, 21.5], [0, 0.7], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      const tx = 960 + side * (250 + (a.id % 80) * 5);
      x = x * (1 - b) + tx * b;
      break;
    }
    case 'ramonc': {
      y += (sec - 24.5) * 8 * (0.5 + Math.sin(a.phase) * 0.5);
      y = ((y % 1080) + 1080) % 1080;
      // Babas: vertical streaks
      x += Math.sin(y * 0.05 + a.phase) * 3;
      break;
    }
    case 'fujur': {
      // Wave pattern — flying dog
      const wave = Math.sin(sec * 0.5 + a.id * 0.002) * 200;
      const b = interpolate(sec, [220, 230], [0, 0.5], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      y = y * (1 - b) + (540 + wave + (a.id % 100 - 50) * 3) * b;
      break;
    }
    case 'espinete': {
      if (a.type === 'espinete') {
        // Dance wiggling hips in the center
        x = 960 + Math.sin(sec * 12) * 50;
        y = 540 + Math.cos(sec * 8) * 30;
      } else {
        // Orbit around Espinete
        const angle = (a.id / 10000) * Math.PI * 20 + sec * 0.5;
        const rad = 250 + (a.id % 400) + Math.sin(sec * 0.5 + a.phase) * 50;
        x = 960 + Math.cos(angle) * rad;
        y = 540 + Math.sin(angle) * rad * 0.6;
      }
      break;
    }
    case 'koldo': {
      const g = interpolate(sec, [245, 258], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      y = y * (1 - g) + (950 + a.size * 10) * g;
      break;
    }
    case 'ane':
    case 'ane_clonk': {
      const impactT = 44.5;
      if (sec > impactT && sec < impactT + 4) {
        const blast = (sec - impactT) / 4;
        x = 960 + Math.cos(a.phase + blast * 12) * blast * 900;
        y = 150 + Math.sin(a.phase * 2 + blast * 10) * blast * 700;
      } else {
        x += Math.sin(frame * 0.9 + a.id * 0.01) * 30;
        y += Math.cos(frame * 0.7 + a.id * 0.008) * 30;
      }
      break;
    }
    case 'gato': {
      x = a.x + Math.sin(sec * 0.03 + a.phase) * 3;
      y = a.y + Math.cos(sec * 0.025 + a.phase) * 3;
      break;
    }
    case 'revelation': {
      const c = interpolate(sec, [34.5, 41.5], [0, 0.97], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      x = x * (1 - c) + 960 * c;
      y = y * (1 - c) + 540 * c;
      break;
    }
    case 'pardo': {
      // Expand from center in pardo-colored ring
      const exp = interpolate(sec, [365, 375], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      const angle = a.phase;
      const r = exp * (200 + a.id % 400) * (1 + volume * 0.2);
      x = 960 + Math.cos(angle) * r;
      y = 540 + Math.sin(angle) * r * 0.6;
      break;
    }
    case 'epilogue': {
      const sc = interpolate(sec, [50.5, 57.0], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      x = 960 + (a.x - 960) * (1 + sc * 4);
      y = 540 + (a.y - 540) * (1 + sc * 4);
      break;
    }
    case 'final': {
      x = 960 + (a.x - 960) * 5; y = 540 + (a.y - 540) * 5;
      break;
    }
  }
  return [x, y];
}

function getAgentRender(a: Agent, sec: number, frame: number, phase: Phase): [number, number, number, number, string, boolean] {
  const volume = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;
  const [x, y] = getAgentPos(a, sec, frame, phase);
  let r = a.size * (a.type === 'normal' ? 1 + volume * 0.7 : 1 + volume * 1.6);
  let opacity = 0.4;
  let glow = false;

  // Type-based color
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

  // Phase modifiers
  switch (phase) {
    case 'title':
      opacity = interpolate(sec, [0, 2], [0, 0.8], { extrapolateRight: 'clamp' });
      r *= 1.5;
      glow = true;
      break;
    case 'intro':
      opacity = a.type !== 'normal' ? 0.7 : 0.2;
      break;
    case 'copisteria':
      opacity = 0.25 + Math.sin(frame * 0.02 + a.id * 0.5) * 0.1;
      color = C.cream; // All same color = fotocopias
      r *= 0.8;
      break;
    case 'flipar':
      opacity = 0.5 + Math.sin(frame * 0.15 + a.phase) * 0.4;
      r *= 1 + Math.sin(frame * 0.3 + a.id * 0.01) * 0.6;
      glow = Math.sin(frame * 0.1 + a.id) > 0.7;
      break;
    case 'edo':
      // 21-EDO — arrange in 21 clusters
      opacity = 0.4;
      const cluster = a.id % 21;
      if (cluster < 7) color = C.accent;
      else if (cluster < 14) color = C.pardo;
      else color = C.red;
      break;
    case 'manolo':
      opacity = a.type === 'cuenca' ? 0.95 : 0.2;
      if (a.type === 'cuenca') { glow = true; r *= 1.8; color = C.pardoGlow; }
      break;
    case 'ertzaintza':
      opacity = 0.35;
      color = a.id % 2 === 0 ? C.accent : C.red;
      break;
    case 'ramonc':
      opacity = 0.45;
      color = C.gold;
      // Vertical streaks = babas
      r = a.size * 0.5;
      break;
    case 'fujur':
      opacity = a.type === 'fujur' ? 0.9 : 0.3;
      if (a.type === 'fujur') { glow = true; r *= 2; color = C.cream; }
      break;
    case 'espinete':
      opacity = a.type === 'espinete' ? 0.95 : 0.25;
      if (a.type === 'espinete') { glow = true; r = 38 * (1 + volume * 0.4); }
      break;
    case 'koldo':
      opacity = 0.5;
      r *= 1.8;
      color = '#555';
      break;
    case 'ane':
    case 'ane_clonk': {
      const impactT = 44.5;
      if (sec > impactT && sec < impactT + 4) {
        opacity = 1; r *= 2.5; glow = true; color = C.redGlow;
      } else {
        opacity = 0.7; color = C.red;
      }
      break;
    }
    case 'gato':
      opacity = a.type === 'gato' ? 0.6 : 0.08;
      if (a.type === 'gato') { glow = true; color = C.greenGlow; r *= 2; }
      else r *= 0.5;
      break;
    case 'revelation':
      opacity = interpolate(sec, [34.5, 41.5], [0.3, 0.9], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      glow = true;
      color = C.accentGlow;
      r *= interpolate(sec, [41.5, 44.5], [1, 3], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      break;
    case 'pardo':
      opacity = 0.8;
      color = C.pardoGlow;
      glow = true;
      break;
    case 'epilogue':
      opacity = interpolate(sec, [50.5, 59.0], [0.5, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      break;
    case 'final':
      opacity = 0;
      break;
  }

  return [x, y, r, opacity, color, glow];
}

// ============================================================
// SUBTITLE OVERLAY — with screen shake for Ane
// ============================================================
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
  const shake = current.shake ? Math.sin(frame * 2.5) * 4 : 0;
  const shakeY = current.shake ? Math.cos(frame * 3.1) * 3 : 0;

  const speakerColor: Record<string, string> = {
    GON: C.accent, MANOLO: C.pardo, ANE: C.red, KOLDO: '#999',
    RAMONCÍN: C.gold, 'EL GATO': C.green, ERTZAINA: '#778',
    OPOSITOR: '#AA8866', TXEMA: '#7788AA',
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

// ============================================================
// FREQUENCY VISUALIZER — bottom bar
// ============================================================
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
      const color = phase === 'ane' || phase === 'ane_clonk' ? C.red :
                    phase === 'manolo' || phase === 'pardo' ? C.pardo :
                    phase === 'gato' ? C.green :
                    phase === 'revelation' ? C.accentGlow :
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

// ============================================================
// SCREEN EFFECTS — Flash, shake, etc.
// ============================================================
const ScreenEffects: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const phase = getPhase(sec);

  // Flash during larguero CLONK
  const clonkFlash = (sec > 268 && sec < 268.3) ? 
    interpolate(sec, [268, 268.1, 268.3], [0, 0.8, 0], { extrapolateRight: 'clamp' }) : 0;

  // Flash during revelation
  const revFlash = (sec > 354 && sec < 355) ?
    interpolate(sec, [354, 354.3, 355], [0, 0.5, 0], { extrapolateRight: 'clamp' }) : 0;

  // Pardo flash
  const pardoFlash = (sec > 372 && sec < 373) ?
    interpolate(sec, [372, 372.2, 373], [0, 0.4, 0], { extrapolateRight: 'clamp' }) : 0;

  return (
    <>
      {/* CLONK flash — white */}
      {clonkFlash > 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: `rgba(255, 255, 255, ${clonkFlash})`,
          mixBlendMode: 'screen',
        }} />
      )}
      {/* Revelation flash — blue */}
      {revFlash > 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 50%, rgba(43, 59, 229, ${revFlash}), transparent 70%)`,
        }} />
      )}
      {/* Pardo flash — brown */}
      {pardoFlash > 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 50%, rgba(107, 66, 38, ${pardoFlash}), transparent 60%)`,
        }} />
      )}
      {/* Vignette always */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)',
        pointerEvents: 'none',
      }} />
    </>
  );
};

// ============================================================
// HUD — Corner info
// ============================================================
const HUD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const phase = getPhase(sec);
  
  const durationInSeconds = durationInFrames / fps;
  const hudOpacity = interpolate(sec, [2, 5, durationInSeconds - 5.0, durationInSeconds - 1.0], [0, 0.35, 0.35, 0], { extrapolateRight: 'clamp' });

  return (
    <>
      <div style={{
        position: 'absolute', top: 28, left: 36,
        color: C.accent, fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
        opacity: hudOpacity, letterSpacing: '0.1em',
      }}>
        AGENTS: 10,000 · 21-EDO · C5-REAL
      </div>
      <div style={{
        position: 'absolute', top: 28, right: 36,
        color: C.pardo, fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
        opacity: hudOpacity, letterSpacing: '0.1em',
      }}>
        PARDO FECAL™
      </div>
      <div style={{
        position: 'absolute', top: 50, left: 36,
        color: '#555', fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
        opacity: hudOpacity * 0.7,
      }}>
        {phase.toUpperCase().replace('_', ' ')} · {sec.toFixed(1)}s
      </div>
      {/* Larguero indicator */}
      {(phase === 'ane' || phase === 'ane_clonk') && (
        <div style={{
          position: 'absolute', top: 50, right: 36,
          color: C.red, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
          opacity: 0.6 + Math.sin(frame * 0.3) * 0.4,
        }}>
          ⚠ MINUTO 93 · LARGUERO
        </div>
      )}
    </>
  );
};

// ============================================================
// MAIN COMPOSITION
// ============================================================
export const GonAgents: React.FC = () => {
  const agents = useMemo(() => generateAgents(10000), []);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const phase = getPhase(sec);

  const currentVol = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;

  // Screen shake: base shake + reactive volume-based shake
  let shakeAmt = currentVol * 14;
  if (phase === 'ane_clonk' && sec > 268 && sec < 280) {
    shakeAmt += 15 * interpolate(sec, [268, 270, 280], [1, 0.5, 0], { extrapolateRight: 'clamp' });
  }
  const shakeX = Math.sin(frame * 3.5) * shakeAmt;
  const shakeY = Math.cos(frame * 4.2) * shakeAmt;

  // Dynamic scale on beat
  const scale = 1 + currentVol * 0.02;

  // Background color per phase
  const bgColor =
    phase === 'ane' || phase === 'ane_clonk' ? '#0F0505' :
    phase === 'manolo' ? '#0A0A06' :
    phase === 'gato' ? '#050808' :
    phase === 'revelation' ? '#06060F' :
    phase === 'pardo' ? '#0A0806' :
    C.bg;

  // Global fade
  const durationInSeconds = durationInFrames / fps;
  const globalOp = interpolate(sec, [0, 0.5, durationInSeconds - 2.0, durationInSeconds], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

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
      <Audio src={staticFile('friccion_dialogs.wav')} />
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
