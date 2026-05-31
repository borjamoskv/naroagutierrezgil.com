import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from 'remotion';
import volumeEnvelope from './volume_envelope_acto2.json';

// ============================================================
// GON Y EL INTERVALO PROHIBIDO — ACTO II: EL ASALTO A LA MESETA
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
  const r = prng(2026);
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
  if (s < 8.5) return 'intro';       // Chamartín overview
  if (s < 15.0) return 'ramonc';     // Ramoncín talking
  if (s < 20.5) return 'revelation'; // OMEGA mapping
  if (s < 28.0) return 'copisteria'; // Tunnel pathway
  if (s < 33.5) return 'ramonc';     // Ramoncín setting up
  if (s < 39.0) return 'ertzaintza';  // Glitch execution
  if (s < 43.5) return 'ertzaintza';  // Chase scene
  if (s < 50.0) return 'ane_clonk';   // Madrid blackout
  if (s < 60.0) return 'revelation';  // Final OMEGA call
  return 'final';
}

// === SUBTITLES ===
interface Sub { s: number; e: number; text: string; who?: string; sz?: number; shake?: boolean; }

const SUBS: Sub[] = [
  { s: 0.0, e: 8.5, text: "El viaje de Bilbao a Madrid se realiza sin trazas digitales. Chamartín, 08:30 AM. La estación es una colmena de zombis con la mirada clavada en pantallas holográficas que parpadean al compás del algoritmo central." },
  { s: 8.5, e: 15.0, text: "Esto huele a asfalto recalentado y a deuda pública, txaval. Demasiada señal en el aire. Me da dolor de cabeza de silicio.", who: "RAMONCÍN", sz: 28 },
  { s: 15.0, e: 20.5, text: "Soberano Omega reportando: Detectado Core Network Madrid Centro. Iniciando mapeo pasivo del andén siete.", who: "SOVEREIGN OMEGA" },
  { s: 20.5, e: 28.0, text: "Para inyectar el virus en la meseta no necesitas un satélite; necesitas acceso al alcantarillado de la Línea diez. Ramoncín abre una caja de derivación eléctrica de hierro fundido." },
  { s: 28.0, e: 33.5, text: "Esto va a doler en las oficinas de Iberdrola, txaval. Tres, dos, uno... ¡Fricción!", who: "RAMONCÍN", sz: 28 },
  { s: 33.5, e: 39.0, text: "Payload Madrid Glitch ejecutado. Inyectando ruido rosa en la Línea diez. Subestación de Plaza de Castilla sobrecargada.", who: "SOVEREIGN OMEGA" },
  { s: 39.0, e: 43.5, text: "¡Movimiento! Los guardias robóticos de Prosegur se acercan. ¡Corred por las vías muertas!", who: "GON" },
  { s: 43.5, e: 50.0, text: "Las pantallas estallan en estática gris. El Flujo se detiene en seco. Madrid se apaga.", shake: true },
  { s: 50.0, e: 60.0, text: "Cuarenta y dos por ciento de la Meseta desconectada. Siguiente objetivo: El nodo central de Telefónica en Gran Vía. Modo fricción absoluta en curso.", who: "SOVEREIGN OMEGA" }
];

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
    gradient.addColorStop(0.7, 'transparent');
    gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const volume = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;

    // Shockwave rings
    if (volume > 0.1) {
      const ringCount = 3;
      for (let rIndex = 0; rIndex < ringCount; rIndex++) {
        const progress = ((frame * 0.35 + rIndex * 15) % 45) / 45;
        const radius = progress * 700 * (0.4 + volume * 0.6);
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = phase === 'ane_clonk' ? `rgba(196, 30, 58, ${0.45 * (1 - progress)})` :
                          phase === 'revelation' ? `rgba(77, 95, 255, ${0.45 * (1 - progress)})` :
                          `rgba(43, 59, 229, ${0.35 * (1 - progress)})`;
        ctx.lineWidth = 1 + volume * 8;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Connection lines
    if (phase === 'revelation' || phase === 'ertzaintza') {
      const specials = agents.filter(a => a.type !== 'normal').slice(0, 80);
      ctx.lineWidth = 0.5;
      for (let i = 0; i < specials.length - 1; i += 2) {
        const a1 = specials[i];
        const a2 = specials[i + 1];
        const [x1, y1] = getAgentPos(a1, sec, frame, phase);
        const [x2, y2] = getAgentPos(a2, sec, frame, phase);
        const dist = Math.hypot(x2 - x1, y2 - y1);
        if (dist < 320) {
          const op = Math.max(0, 0.2 - dist / 1800);
          ctx.strokeStyle = `rgba(77, 95, 255, ${op})`;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
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
  const kick = volume * 18;
  let x = a.x + Math.sin(t * 0.3) * 40 + a.vx * frame * 0.08 + a.vx * kick;
  let y = a.y + Math.cos(t * 0.25 + 0.7) * 35 + a.vy * frame * 0.08 + a.vy * kick;
  x = ((x % 1920) + 1920) % 1920;
  y = ((y % 1080) + 1080) % 1080;

  switch (phase) {
    case 'intro': {
      // Flow lines representing railway grid
      const track = Math.floor(a.y / 200) * 200 + 100;
      const b = interpolate(sec, [0, 4], [0, 0.6], { extrapolateRight: 'clamp' });
      y = y * (1 - b) + track * b;
      break;
    }
    case 'copisteria': {
      // Static grid (underground tunnels)
      const gx = (a.id % 120) * 16; const gy = Math.floor(a.id / 120) * 13;
      const b = interpolate(sec, [20.5, 23.5], [0, 0.75], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      x = x * (1 - b) + gx * b; y = y * (1 - b) + gy * b;
      break;
    }
    case 'ertzaintza': {
      // Circular orbit (blackout shield/field)
      const angle = (a.id / 10000) * Math.PI * 15 + sec * 0.8;
      const rad = 300 + (a.id % 400);
      const b = interpolate(sec, [33.5, 36.0], [0, 0.8], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      x = x * (1 - b) + (960 + Math.cos(angle) * rad) * b;
      y = y * (1 - b) + (540 + Math.sin(angle) * rad * 0.6) * b;
      break;
    }
    case 'revelation': {
      // Convergence towards center OMEGA node
      const c = interpolate(sec, [50.0, 56.0], [0, 0.98], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
      x = x * (1 - c) + 960 * c;
      y = y * (1 - c) + 540 * c;
      break;
    }
    case 'ane_clonk': {
      // Blackout drop and spark blast
      const impactT = 43.5;
      if (sec > impactT && sec < impactT + 4) {
        const blast = (sec - impactT) / 4;
        x = 960 + Math.cos(a.phase) * blast * 1200;
        y = 540 + Math.sin(a.phase) * blast * 900;
      }
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
    case 'intro':
      opacity = a.type !== 'normal' ? 0.75 : 0.25;
      color = a.id % 2 === 0 ? C.accent : C.dim;
      break;
    case 'ramonc':
      opacity = a.type === 'cuenca' ? 0.9 : 0.3;
      color = C.gold;
      r = a.size * 0.75;
      break;
    case 'revelation':
      opacity = 0.85;
      glow = true;
      color = C.accentGlow;
      break;
    case 'copisteria':
      opacity = 0.3;
      color = C.cream;
      break;
    case 'ertzaintza':
      opacity = 0.75;
      color = a.id % 2 === 0 ? C.accentGlow : C.red;
      break;
    case 'ane_clonk':
      opacity = interpolate(sec, [43.5, 44.5], [1, 0.05], { extrapolateRight: 'clamp' });
      color = C.redGlow;
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
      const color = phase === 'ertzaintza' ? C.red :
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

const ScreenEffects: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const phase = getPhase(sec);

  // Blackout static flash for Scene 9
  const staticFlash = (sec > 43.5 && sec < 44.5) ? 
    interpolate(sec, [43.5, 43.6, 44.5], [0, 0.9, 0], { extrapolateRight: 'clamp' }) : 0;

  return (
    <>
      {staticFlash > 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: `rgba(200, 200, 200, ${staticFlash})`,
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
        MADRID-GLITCH // CORE-NODE // C5-REAL
      </div>
      <div style={{
        position: 'absolute', top: 28, right: 36,
        color: C.pardo, fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
        opacity: hudOpacity, letterSpacing: '0.1em',
      }}>
        CHAMARTÍN SEC-07
      </div>
      <div style={{
        position: 'absolute', top: 50, left: 36,
        color: '#555', fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
        opacity: hudOpacity * 0.7,
      }}>
        {phase.toUpperCase().replace('_', ' ')} · {sec.toFixed(1)}s
      </div>
      {phase === 'ertzaintza' && (
        <div style={{
          position: 'absolute', top: 50, right: 36,
          color: C.red, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
          opacity: 0.6 + Math.sin(frame * 0.3) * 0.4,
        }}>
          ⚠ CASCADE FAILURE IN PROGRESS
        </div>
      )}
    </>
  );
};

export const GonAgentsActo2: React.FC = () => {
  const agents = useMemo(() => generateAgents(10000), []);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const phase = getPhase(sec);

  const currentVol = volumeEnvelope[Math.min(Math.floor(frame), volumeEnvelope.length - 1)] || 0;

  let shakeAmt = currentVol * 14;
  if (phase === 'ertzaintza' && sec > 39.0 && sec < 43.5) {
    shakeAmt += 8;
  }
  if (phase === 'ane_clonk' && sec > 43.5 && sec < 48.0) {
    shakeAmt += 20 * interpolate(sec, [43.5, 44.5, 48.0], [1, 0.5, 0], { extrapolateRight: 'clamp' });
  }
  const shakeX = Math.sin(frame * 3.5) * shakeAmt;
  const shakeY = Math.cos(frame * 4.2) * shakeAmt;

  const scale = 1 + currentVol * 0.02;

  const bgColor =
    phase === 'ertzaintza' ? '#0F0505' :
    phase === 'revelation' ? '#06060F' :
    phase === 'ane_clonk' ? '#000000' :
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
      <Audio src={staticFile('friccion_acto2_dialogs.wav')} />
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
