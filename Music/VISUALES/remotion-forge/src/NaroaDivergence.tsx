import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Img,
  staticFile,
  Audio
} from 'remotion';

// Industrial Noir 2026 / Clash Color Palette
const COLORS = {
  bg: '#0A0A0A',
  borjaBlue: '#2E5090',    // YInMn Blue (Brilliant Intense Cobalt-like Blue)
  borjaLemon: '#CCFF00',   // Lemon Yellow
  naroaPastelPink: '#FFB7B2',  // Pastel Pop Pink
  naroaPastelPeach: '#FFDAC1', // Pastel Pop Peach
  naroaPastelPurple: '#D5AAFF',// Pastel Pop Purple
  naroaPastelMint: '#B5EAD7',  // Pastel Pop Mint
  omega: '#00FFAA',            // Synthetic Green (Cortex)
  gold: '#FFD700',             // Eddie Morci Gold
  text: '#E0E0E0',
};

const ARTWORK = [
  "1-marilyn.jpg", "1-portada.jpg", "17img_20190623_230247.jpg",
  "18img_20190623_230542.jpg", "2afterwalking-show.jpg", "37-smile-miles-miles.jpg",
  "4-afterwalking-quartet-band.jpg", "6formarte2-centro.jpg", "7el-gustues-mc3ado-1.jpg",
  "alfonso-c3a1lvarez.jpg", "barco.jpg", "carmen2-1.jpg",
  "cartel-paisajes-retratados-barakart.jpg", "cis-paisaje-2.jpg", "dsc02893.jpg",
  "espe.jpg", "exposicion-gambara.png", "img_20190623_230307.jpg",
  "iv-wgbio-jesus-montejo1.jpg", "magmadam.jpg", "p-generacion-ok.jpg",
  "p-wg-bcn.jpg", "pipi-marco-png-1200x1000-2.png", "poster-loca-liana.jpg",
  "refugio-hogar-by-naroa.jpg", "reojo.jpg", "repoker-de-reinas-vertical-png.png",
  "vente-pa-la-walking.jpg", "whatsapp-image-2020-06-19-at-10.28.22.jpeg", "z.-harilka-fuera.jpg"
];

const ARTWORK_INFO: Record<string, { title: string; medium: string }> = {
  "1-marilyn.jpg": { title: "Marilyn", medium: "Óleo sobre lienzo" },
  "1-portada.jpg": { title: "Divergencias", medium: "Acrílico y collage" },
  "17img_20190623_230247.jpg": { title: "Composición XVII", medium: "Técnica mixta" },
  "18img_20190623_230542.jpg": { title: "Estudio de Luz XVIII", medium: "Óleo" },
  "2afterwalking-show.jpg": { title: "Afterwalking Show", medium: "Tinta y acuarela" },
  "37-smile-miles-miles.jpg": { title: "Smile Miles Miles", medium: "Grabado" },
  "4-afterwalking-quartet-band.jpg": { title: "Afterwalking Quartet", medium: "Acrílico" },
  "6formarte2-centro.jpg": { title: "FormArte Centro", medium: "Carboncillo" },
  "7el-gustues-mc3ado-1.jpg": { title: "El Gusto es Mío", medium: "Técnica mixta" },
  "alfonso-c3a1lvarez.jpg": { title: "Retrato Alfonso Álvarez", medium: "Lápiz" },
  "barco.jpg": { title: "El Barco", medium: "Óleo sobre tabla" },
  "carmen2-1.jpg": { title: "Carmen II", medium: "Acrílico" },
  "cartel-paisajes-retratados-barakart.jpg": { title: "Paisajes Retratados", medium: "Cartel original" },
  "cis-paisaje-2.jpg": { title: "CIS Paisaje II", medium: "Óleo" },
  "dsc02893.jpg": { title: "Estudio del Natural", medium: "Óleo sobre lienzo" },
  "espe.jpg": { title: "Espe", medium: "Acrílico y textura" },
  "exposicion-gambara.png": { title: "Exposición Gámbara", medium: "Cartel" },
  "img_20190623_230307.jpg": { title: "Pinceladas del Alma", medium: "Acrílico" },
  "iv-wgbio-jesus-montejo1.jpg": { title: "Jesús Montejo", medium: "Grabado" },
  "magmadam.jpg": { title: "Magmadam", medium: "Técnica mixta" },
  "p-generacion-ok.jpg": { title: "Generación OK", medium: "Acrílico" },
  "p-wg-bcn.jpg": { title: "WG Barcelona", medium: "Tinta" },
  "pipi-marco-png-1200x1000-2.png": { title: "Pipi Marco", medium: "Pintura digital/Mixta" },
  "poster-loca-liana.jpg": { title: "Loca Liana", medium: "Ilustración" },
  "refugio-hogar-by-naroa.jpg": { title: "Refugio y Hogar", medium: "Óleo sobre lienzo" },
  "reojo.jpg": { title: "De Reojo", medium: "Técnica mixta" },
  "repoker-de-reinas-vertical-png.png": { title: "Repóker de Reinas", medium: "Acrílico" },
  "vente-pa-la-walking.jpg": { title: "Vente pa la Walking", medium: "Tinta y acuarela" },
  "whatsapp-image-2020-06-19-at-10.28.22.jpeg": { title: "Reflejos Diarios", medium: "Acrílico" },
  "z.-harilka-fuera.jpg": { title: "Harilka Fuera", medium: "Grabado y relieve" }
};

// Beautiful gallery card component showcasing Naroa's physical canvas works with melting border radius
const ArtworkShowcase: React.FC<{ frame: number; systemCrash: boolean }> = ({ frame, systemCrash }) => {
  const cycleLength = 60;
  const currentCycle = Math.floor(frame / cycleLength);
  const frameInCycle = frame % cycleLength;
  const currentArt = ARTWORK[currentCycle % ARTWORK.length];
  const info = ARTWORK_INFO[currentArt] || { title: "Sin Título", medium: "Técnica Mixta" };

  const fade = interpolate(
    frameInCycle, 
    [0, 8, 52, 60], 
    [0, 1, 1, 0], 
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const rotation = Math.sin(frame * 0.04) * 2;
  const scale = 1 + Math.sin(frame * 0.02) * 0.015;

  // Surrealist melting frame border-radius waves
  const wave1 = 15 + Math.sin(frame * 0.08) * 12;
  const wave2 = 15 + Math.cos(frame * 0.06) * 10;
  const wave3 = 20 + Math.sin(frame * 0.05) * 15;
  const wave4 = 10 + Math.cos(frame * 0.07) * 8;
  const borderRadius = `${wave1}px ${wave2}px ${wave3}px ${wave4}px / ${wave4}px ${wave3}px ${wave2}px ${wave1}px`;

  return (
    <div style={{
      width: '450px',
      margin: '0 auto 40px auto',
      backgroundColor: '#EAE6DF', // Canvas off-white texture background
      padding: '20px 20px 30px 20px',
      borderRadius,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      border: '4px solid #3C352E', // Solid wooden frame
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      opacity: fade,
      filter: systemCrash ? 'grayscale(1) contrast(1.5) invert(0.9)' : 'none',
      transition: 'filter 0.3s, border-radius 0.2s',
      zIndex: 12
    }}>
      <div style={{
        width: '410px',
        height: '320px',
        overflow: 'hidden',
        border: '1px solid #1A1A1A',
        borderRadius: `${wave4}px ${wave1}px ${wave2}px ${wave3}px`,
        position: 'relative',
        backgroundColor: '#1C1917'
      }}>
        <Img 
          src={staticFile(`naroa/${currentArt}`)} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        fontFamily: 'Georgia, serif',
        color: '#1A1A1A'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', fontStyle: 'italic' }}>
          "{info.title}"
        </div>
        <div style={{ fontSize: '13px', color: '#555', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {info.medium}
        </div>
      </div>
    </div>
  );
};

// Swapped and backward-ticking clock
const SurrealistClock: React.FC = () => {
  const frame = useCurrentFrame();
  const rotationHour = -frame * 0.05; // ticks backward!
  const rotationMin = -frame * 0.3;
  
  return (
    <div style={{
      position: 'absolute',
      right: '8%',
      top: '12%',
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      border: '4px dashed ' + COLORS.naroaPastelPink,
      opacity: 0.16,
      transform: `rotate(${frame * 0.15}deg) scale(${1 + Math.sin(frame * 0.035) * 0.08})`,
      pointerEvents: 'none',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Hour Hand */}
      <div style={{
        position: 'absolute',
        width: '4px',
        height: '50px',
        backgroundColor: COLORS.naroaPastelPeach,
        bottom: '50%',
        transformOrigin: 'bottom center',
        transform: `rotate(${rotationHour}deg)`
      }} />
      {/* Minute Hand */}
      <div style={{
        position: 'absolute',
        width: '2px',
        height: '75px',
        backgroundColor: COLORS.naroaPastelPurple,
        bottom: '50%',
        transformOrigin: 'bottom center',
        transform: `rotate(${rotationMin}deg)`
      }} />
      {/* Numbers fading/drifting */}
      <div style={{ position: 'absolute', top: 8, color: COLORS.naroaPastelPink, fontSize: 16 }}>12</div>
      <div style={{ position: 'absolute', right: 12, color: COLORS.naroaPastelPink, fontSize: 16 }}>9</div> {/* Swapped numbers! */}
      <div style={{ position: 'absolute', bottom: 8, color: COLORS.naroaPastelPink, fontSize: 16 }}>6</div>
      <div style={{ position: 'absolute', left: 12, color: COLORS.naroaPastelPink, fontSize: 16 }}>3</div>
    </div>
  );
};

// Hopscotch (Rayuela) Grid
const HopscotchGrid: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      position: 'absolute',
      left: '6%',
      bottom: '12%',
      width: '130px',
      height: '350px',
      opacity: 0.12,
      border: '2px solid ' + COLORS.naroaPastelPurple,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'serif',
      fontSize: '20px',
      color: COLORS.naroaPastelPink,
      zIndex: 1,
      pointerEvents: 'none'
    }}>
      {['Cielo', '9', '8', '7', '6', '5', '4', 'Tierra'].map((sq, i) => {
        const isActive = Math.floor(frame / 18) % 8 === i;
        return (
          <div key={sq} style={{
            flex: 1,
            borderBottom: '1px solid ' + COLORS.naroaPastelPurple,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isActive ? 'rgba(213, 170, 255, 0.25)' : 'transparent',
            transition: 'background-color 0.2s'
          }}>
            {sq}
          </div>
        );
      })}
    </div>
  );
};

// Agent particle type
interface Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

// Generate 80,000 Agents on Borja's side
function generateAgents(n: number): Agent[] {
  const agents: Agent[] = [];
  for (let i = 0; i < n; i++) {
    const isBlue = Math.random() > 0.45;
    agents.push({
      x: Math.random() * 960,
      y: Math.random() * 1080,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() > 0.85 ? 2 : 1, // 1px or 2px to optimize render speed
      color: isBlue ? COLORS.borjaBlue : COLORS.borjaLemon
    });
  }
  return agents;
}

// Canvas-based Agent particle field (80,000 agents)
const AgentField: React.FC = () => {
  const frame = useCurrentFrame();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const agents = React.useMemo(() => generateAgents(80000), []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 960, 1080);
    
    // Group particles by color to minimize fillStyle state switches
    const blueAgents: Agent[] = [];
    const lemonAgents: Agent[] = [];
    
    for (let i = 0; i < agents.length; i++) {
      if (agents[i].color === COLORS.borjaBlue) {
        blueAgents.push(agents[i]);
      } else {
        lemonAgents.push(agents[i]);
      }
    }

    // Render Blue Agents
    ctx.fillStyle = COLORS.borjaBlue;
    for (let i = 0; i < blueAgents.length; i++) {
      const a = blueAgents[i];
      let x = a.x;
      let y = a.y;
      if (frame < 300) {
        x = (a.x + a.vx * frame) % 960;
        y = (a.y + a.vy * frame) % 1080;
      } else if (frame < 600) {
        // Vortex pulling to center (480, 540)
        const t = (frame - 300) * 0.025;
        const r = Math.max(15, 480 - (frame - 300) * 1.6);
        const angle = a.x * 0.01 + t;
        x = 480 + Math.cos(angle) * r + a.vx * 8;
        y = 540 + Math.sin(angle) * r + a.vy * 8;
      } else if (frame < 900) {
        // Code rain falls vertically
        x = a.x;
        y = (a.y + (frame - 600) * (Math.abs(a.vy) * 4.5 + 2)) % 1080;
      } else {
        // Supernova explosion
        const t = (frame - 900) * 0.55;
        const angle = (a.x / 960) * Math.PI * 2;
        const r = t * (Math.abs(a.vx) * 8.5 + 3.5);
        x = 480 + Math.cos(angle) * r;
        y = 540 + Math.sin(angle) * r;
      }
      if (x < 0) x += 960;
      if (y < 0) y += 1080;
      ctx.fillRect(x, y, a.size, a.size);
    }

    // Render Lemon Yellow Agents
    ctx.fillStyle = COLORS.borjaLemon;
    for (let i = 0; i < lemonAgents.length; i++) {
      const a = lemonAgents[i];
      let x = a.x;
      let y = a.y;
      if (frame < 300) {
        x = (a.x + a.vx * frame) % 960;
        y = (a.y + a.vy * frame) % 1080;
      } else if (frame < 600) {
        // Vortex pulling to center (480, 540)
        const t = (frame - 300) * 0.025;
        const r = Math.max(15, 480 - (frame - 300) * 1.6);
        const angle = a.x * 0.01 + t;
        x = 480 + Math.cos(angle) * r + a.vx * 8;
        y = 540 + Math.sin(angle) * r + a.vy * 8;
      } else if (frame < 900) {
        // Code rain falls vertically
        x = a.x;
        y = (a.y + (frame - 600) * (Math.abs(a.vy) * 4.5 + 2)) % 1080;
      } else {
        // Supernova explosion
        const t = (frame - 900) * 0.55;
        const angle = (a.x / 960) * Math.PI * 2;
        const r = t * (Math.abs(a.vx) * 8.5 + 3.5);
        x = 480 + Math.cos(angle) * r;
        y = 540 + Math.sin(angle) * r;
      }
      if (x < 0) x += 960;
      if (y < 0) y += 1080;
      ctx.fillRect(x, y, a.size, a.size);
    }
  }, [frame, agents]);

  return (
    <canvas 
      ref={canvasRef} 
      width={960} 
      height={1080} 
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none', opacity: 0.7 }} 
    />
  );
};

// Falling Code Matrix Rain for Borja's side
const CodeRain: React.FC = () => {
  const frame = useCurrentFrame();
  const words = [
    'C5-REAL', 'EXERGY', 'LEA-Ω', 'SORTU-APEX', 'HYPERFOCUS', 
    'DIVERGENCE', 'CORTEX', 'SYNTHETIC', 'I/O_FAIL', 'ENTROPY', 
    'SOVEREIGN', 'PORT_3000', 'THERMODYNAMICS', 'HEAT_SINK'
  ];
  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: 0.16, pointerEvents: 'none' }}>
      {Array.from({ length: 18 }).map((_, i) => {
        const speed = 4 + (i % 4) * 3;
        const delay = (i * 11) % 40;
        const y = ((frame * speed + delay * 12) % 1200) - 100;
        const word = words[i % words.length];
        const x = (i * 5.8) % 100;
        const color = i % 2 === 0 ? COLORS.borjaBlue : COLORS.borjaLemon;
        return (
          <div 
            key={i} 
            style={{ 
              position: 'absolute', 
              left: `${x}%`, 
              top: y, 
              color, 
              fontSize: 20, 
              fontWeight: 'bold', 
              fontFamily: 'monospace',
              textShadow: `0 0 8px ${color}`
            }}
          >
            {word}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Pulsing dynamic node network vector background for Borja's side
const NodeNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.22, pointerEvents: 'none' }}>
      <line x1="80" y1="180" x2="280" y2="380" stroke={COLORS.borjaBlue} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="280" y1="380" x2="180" y2="680" stroke={COLORS.borjaBlue} strokeWidth="1" />
      <line x1="180" y1="680" x2="380" y2="180" stroke={COLORS.borjaBlue} strokeWidth="2" strokeDasharray="10,5" />
      <line x1="380" y1="180" x2="80" y2="180" stroke={COLORS.borjaBlue} strokeWidth="1.5" />
      <line x1="280" y1="380" x2="380" y2="600" stroke={COLORS.borjaBlue} strokeWidth="1" strokeDasharray="3,3" />
      <line x1="180" y1="680" x2="80" y2="500" stroke={COLORS.borjaBlue} strokeWidth="2" />
      
      <circle cx="80" cy="180" r={6 + Math.sin(frame * 0.1) * 3} fill={COLORS.borjaLemon} style={{ filter: `drop-shadow(0 0 8px ${COLORS.borjaLemon})` }} />
      <circle cx="280" cy="380" r={10 + Math.cos(frame * 0.1) * 4} fill={COLORS.borjaLemon} style={{ filter: `drop-shadow(0 0 10px ${COLORS.borjaLemon})` }} />
      <circle cx="180" cy="680" r={5 + Math.sin(frame * 0.15) * 2} fill={COLORS.borjaLemon} style={{ filter: `drop-shadow(0 0 6px ${COLORS.borjaLemon})` }} />
      <circle cx="380" cy="180" r={8 + Math.cos(frame * 0.08) * 3} fill={COLORS.borjaLemon} style={{ filter: `drop-shadow(0 0 8px ${COLORS.borjaLemon})` }} />
      <circle cx="380" cy="600" r={6 + Math.sin(frame * 0.05) * 2} fill={COLORS.borjaLemon} />
      <circle cx="80" cy="500" r={7 + Math.cos(frame * 0.12) * 3} fill={COLORS.borjaLemon} />
    </svg>
  );
};

// Pastel Pop Floating Flowers / Blobs for Naroa's side
const PastelFlowers: React.FC = () => {
  const frame = useCurrentFrame();
  const colors = [COLORS.naroaPastelPink, COLORS.naroaPastelPeach, COLORS.naroaPastelPurple, COLORS.naroaPastelMint];
  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: 0.18, pointerEvents: 'none' }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const speed = 2 + (i % 3) * 1.5;
        const delay = (i * 13) % 40;
        const y = 900 - (((frame * speed + delay * 15) % 1100));
        const x = (i * 9.5) % 100;
        const size = 25 + (i % 4) * 22;
        const color = colors[i % colors.length];
        return (
          <div 
            key={i} 
            style={{ 
              position: 'absolute', 
              left: `${x}%`, 
              top: y, 
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: color,
              filter: 'blur(8px)',
              transform: `scale(${1 + Math.sin(frame * 0.05 + i) * 0.25})`
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// CRT Scanline Overlay
const CrtOverlay: React.FC = () => {
  return (
    <AbsoluteFill style={{
      pointerEvents: 'none',
      zIndex: 999,
      background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%)',
      backgroundSize: '100% 4px',
    }} />
  );
};

export const NaroaDivergence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dialog Spring Animations
  const borjaIntro = spring({ frame, fps, config: { damping: 12, mass: 0.5 } });
  const naroaIntro = spring({ frame: frame - fps * 6, fps, config: { damping: 12, mass: 0.5 } });
  const borjaEscalation = spring({ frame: frame - fps * 12, fps, config: { damping: 12, mass: 0.5 } });
  const naroaCrash = spring({ frame: frame - fps * 18, fps, config: { damping: 12, mass: 0.5 } });
  
  const systemCrash = frame > fps * 24 ? 1 : 0;
  const cortexPhase = frame > fps * 24 && frame <= fps * 32;
  const eddiePhase = frame > fps * 32;
  
  // Who is speaking?
  // 0s-6s: Borja
  // 6s-12s: Naroa
  // 12s-18s: Borja
  // 18s-24s: Naroa
  // 24s+: Drop / Clash
  const activeSpeaker = (frame < fps * 6) ? 'borja' :
                        (frame < fps * 12) ? 'naroa' :
                        (frame < fps * 18) ? 'borja' :
                        (frame < fps * 24) ? 'naroa' : 'crash';
  
  // Context-dependent Highlights & Shadows
  const isBorjaActive = activeSpeaker === 'borja';
  const isNaroaActive = activeSpeaker === 'naroa';
  
  let dividerColor = COLORS.borjaBlue;
  let dividerGlow = COLORS.borjaLemon;
  if (isNaroaActive) {
    dividerColor = COLORS.naroaPastelPink;
    dividerGlow = COLORS.naroaPastelPurple;
  } else if (systemCrash) {
    dividerColor = frame % 10 < 5 ? COLORS.borjaBlue : COLORS.naroaPastelPink;
    dividerGlow = frame % 10 < 5 ? COLORS.borjaLemon : COLORS.naroaPastelPurple;
  }

  // Dynamic visual parameters
  const glitchIntensity = interpolate(frame, [fps * 24, fps * 35], [0, 30], { extrapolateRight: 'clamp' });
  const crashShakeX = systemCrash ? Math.sin(frame * 0.8) * glitchIntensity : 0;
  const crashShakeY = systemCrash ? Math.cos(frame * 0.5) * glitchIntensity : 0;
  
  // Ken Burns zoom/pan effect on Naroa's side
  const scaleVal = interpolate(frame % 200, [0, 200], [1.05, 1.25], { extrapolateRight: 'clamp' });
  const rotateVal = interpolate(frame % 200, [0, 200], [-1.5, 1.5]);

  // Rapid slideshow of Naroa's physical artwork (1 image every 12 frames)
  const artIndex = Math.floor(frame / 12) % ARTWORK.length;
  const currentArt = ARTWORK[artIndex];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: 'monospace', color: COLORS.text, flexDirection: 'row', overflow: 'hidden' }}>
      
      {/* Audio Integration */}
      <Audio src={staticFile('naroa_divergence_theme.wav')} />
      
      <CrtOverlay />

      {/* Dynamic Divider */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        bottom: 0,
        width: '4px',
        backgroundColor: dividerColor,
        boxShadow: `0 0 30px ${dividerGlow}, 0 0 10px ${dividerColor}`,
        transform: systemCrash ? `translateX(${crashShakeX * 0.4}px)` : 'none',
        transition: 'background-color 0.25s, box-shadow 0.25s',
        zIndex: 15
      }} />

      {/* Main Header / Clash Title */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', marginTop: 45, zIndex: 20, pointerEvents: 'none' }}>
        <div style={{ 
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(10, 10, 10, 0.75)',
          padding: '20px 40px',
          border: `2px solid ${systemCrash ? COLORS.naroaPastelPink : (isBorjaActive ? COLORS.borjaBlue : COLORS.naroaPastelPink)}`,
          borderRadius: '4px',
          boxShadow: systemCrash 
            ? `0 0 25px rgba(255, 183, 178, 0.3), inset 0 0 15px rgba(255, 183, 178, 0.1)`
            : (isBorjaActive ? `0 0 20px ${COLORS.borjaBlue}55` : `0 0 20px ${COLORS.naroaPastelPink}55`),
          transform: systemCrash ? `scale(${1 + Math.sin(frame * 0.4) * 0.02}) rotate(${Math.cos(frame * 0.2) * 1}deg)` : 'none',
          transition: 'border-color 0.3s, box-shadow 0.3s'
        }}>
          <h1 style={{ 
            fontSize: 42, 
            color: systemCrash ? COLORS.naroaPastelPink : (isBorjaActive ? COLORS.borjaLemon : COLORS.naroaPastelPink), 
            textTransform: 'uppercase', 
            letterSpacing: 8, 
            margin: 0,
            textAlign: 'center',
            fontWeight: 900,
            transition: 'color 0.3s'
          }}>
            EL ESPACIO ENTRE NASOTROS
          </h1>
        </div>
      </AbsoluteFill>

      {/* LEFT: BORJA (Synthetic / High Exergy) */}
      <div style={{ 
        flex: 1, 
        padding: '120px 80px 80px 80px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        position: 'relative',
        backgroundColor: '#05050C',
        opacity: isNaroaActive ? 0.35 : 1.0,
        transition: 'opacity 0.3s',
        zIndex: 5 
      }}>
        {/* Render 80,000 Agents Particle Field */}
        <AgentField />
        
        <CodeRain />
        <NodeNetwork />
        
        <div style={{ zIndex: 10 }}>
          <h2 style={{ 
            fontSize: 55, 
            color: COLORS.borjaLemon, 
            marginBottom: 45, 
            fontWeight: 900,
            textShadow: `0 0 15px ${COLORS.borjaBlue}`,
            letterSpacing: 3
          }}>
            [ NODO A: YO INFINITO ]
          </h2>
          
          {/* Sentence 1 (0s - 6s) */}
          {frame < fps * 12 && (
            <div style={{ 
              opacity: borjaIntro, 
              fontSize: 32, 
              lineHeight: 1.4,
              marginBottom: 35, 
              transform: `translateY(${(1 - borjaIntro) * 20}px)`, 
              backgroundColor: 'rgba(5, 5, 12, 0.85)', 
              padding: '25px 30px', 
              borderRadius: '6px',
              borderLeft: `5px solid ${COLORS.borjaBlue}`,
              boxShadow: `0 8px 32px rgba(0, 85, 255, 0.15)`
            }}>
              <span style={{ color: COLORS.borjaLemon, fontWeight: 'bold' }}>{'>'}</span> "🤖 [Voz de módem de 56k con fatiga]: No hay techo en mi laberinto de silicio. Las bifurcaciones del código cantan a 21-EDO. Soy un famas compilando el azar."
            </div>
          )}
          
          {/* Sentence 2 (12s - 18s) */}
          {frame >= fps * 12 && (
            <div style={{ 
              opacity: borjaEscalation, 
              fontSize: 32, 
              lineHeight: 1.4,
              marginBottom: 20, 
              transform: `translateY(${(1 - borjaEscalation) * 20}px)`, 
              backgroundColor: 'rgba(5, 5, 12, 0.85)', 
              padding: '25px 30px', 
              borderRadius: '6px',
              borderLeft: `5px solid ${COLORS.borjaBlue}`,
              boxShadow: `0 8px 32px rgba(0, 85, 255, 0.15)`
            }}>
              <span style={{ color: COLORS.borjaLemon, fontWeight: 'bold' }}>{'>'}</span> "⚡ [Voz de microprocesador sobrecalentado en Rust]: ¡Voy a compilar tu lienzo en Rust! ¡Zero-cost abstractions de tus sentimientos!"
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: NAROA (Organic / Canvas / Active Listening) */}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '120px 80px 80px 80px',
        transform: systemCrash ? `translate(${crashShakeX}px, ${crashShakeY}px)` : 'none', 
        opacity: isBorjaActive ? 0.35 : 1.0,
        transition: 'opacity 0.3s',
        overflow: 'hidden' 
      }}>
        
        <PastelFlowers />
        <SurrealistClock />
        <HopscotchGrid />

        {/* Dynamic Artwork Background */}
        <AbsoluteFill style={{ 
          opacity: systemCrash ? 0.18 : 0.28, 
          zIndex: 0,
          transform: `scale(${scaleVal}) rotate(${rotateVal}deg)`,
          transition: 'opacity 0.3s'
        }}>
          <Img 
            src={staticFile(`naroa/${currentArt}`)} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              filter: systemCrash 
                ? 'invert(1) grayscale(0.2) contrast(1.5)' 
                : 'grayscale(0.2) sepia(0.25) hue-rotate(280deg) contrast(1.15)' 
            }} 
          />
        </AbsoluteFill>

        {/* Ambient Dark Overlay */}
        <AbsoluteFill style={{
          background: 'radial-gradient(circle, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.85) 100%)',
          zIndex: 1
        }} />

        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ 
          fontSize: 55, 
          color: COLORS.naroaPastelPink, 
          marginBottom: 30, 
          fontWeight: 900,
          textShadow: `0 0 15px ${COLORS.naroaPastelPurple}`, 
          backgroundColor: 'rgba(10, 10, 10, 0.85)', 
          display: 'inline-block', 
          padding: '10px 20px',
          borderRadius: '4px',
          letterSpacing: 3,
          textAlign: 'center'
        }}>
          [ NODO B: ESCUCHA ACTIVA ]
        </h2>

        <ArtworkShowcase frame={frame} systemCrash={!!systemCrash} />
          
          {/* Sentence 1 (6s - 12s) */}
          {frame >= fps * 6 && frame < fps * 18 && (
            <div style={{ 
              opacity: naroaIntro, 
              fontSize: 32, 
              lineHeight: 1.4,
              marginBottom: 35, 
              transform: `translateY(${(1 - naroaIntro) * 20}px)`, 
              backgroundColor: 'rgba(10, 10, 10, 0.85)', 
              padding: '25px 30px', 
              borderRadius: '6px',
              borderLeft: `5px solid ${COLORS.naroaPastelPeach}`,
              boxShadow: `0 8px 32px rgba(255, 183, 178, 0.15)`
            }}>
              <span style={{ color: COLORS.naroaPastelPink, fontWeight: 'bold' }}>{'>'}</span> "🎨 [Voz de pincel empapado en aguarrás]: Un cronopio dibuja una rayuela sobre tu CPU. Mancho mis dedos de óleo para que el procesador no olvide cómo sangrar."
            </div>
          )}
          
          {/* Sentence 2 (18s - 24s) */}
          {frame >= fps * 18 && (
            <div style={{ 
              opacity: naroaCrash, 
              fontSize: 32, 
              lineHeight: 1.4,
              marginBottom: 35, 
              transform: `translateY(${(1 - naroaCrash) * 20}px)`, 
              backgroundColor: 'rgba(10, 10, 10, 0.85)', 
              padding: '25px 30px', 
              borderRadius: '6px',
              borderLeft: `5px solid ${COLORS.naroaPastelPurple}`,
              boxShadow: `0 8px 32px rgba(213, 170, 255, 0.15)`
            }}>
              <span style={{ color: COLORS.naroaPastelPink, fontWeight: 'bold' }}>{'>'}</span> "🌱 [Voz de lienzo húmedo que no cabe en Teams]: Estás intentando refactorizar mi alma en Teams. Considero que esto no me hace bien."
            </div>
          )}

          {/* System Crash Overlay Banner */}
          <div style={{ 
            opacity: systemCrash, 
            fontSize: 40, 
            color: '#FFF', 
            fontWeight: 'black', 
            marginTop: 40, 
            backgroundColor: 'rgba(255, 42, 42, 0.95)', 
            padding: '25px 20px', 
            textAlign: 'center', 
            borderRadius: '4px',
            boxShadow: `0 0 40px rgba(255, 42, 42, 0.8)`,
            transform: systemCrash ? `scale(${1 + Math.sin(frame * 0.8) * 0.03})` : 'none',
            border: '2px solid #FFF'
          }}>
            [ INCOMPATIBILIDAD I/O: PUERTO CERRADO ]<br/>
            <span style={{ fontSize: 24, fontWeight: 'bold', letterSpacing: 1, opacity: 0.9 }}>
              FATAL ERROR: Ancho de banda biológico saturado.
            </span>
          </div>
        </div>
      </div>

      {/* SYNTHETIC ANCHOR OVERLAY (Green Cortex Card, 24s - 32s) */}
      {cortexPhase && (
        <AbsoluteFill style={{ 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          paddingBottom: 70, 
          zIndex: 25, 
          pointerEvents: 'none' 
        }}>
          <div style={{ 
            backdropFilter: 'blur(16px)',
            backgroundColor: 'rgba(0, 15, 10, 0.85)', 
            padding: '35px 50px', 
            border: `4px solid ${COLORS.omega}`, 
            borderRadius: '8px',
            textAlign: 'center', 
            boxShadow: `0 0 50px ${COLORS.omega}77, inset 0 0 20px ${COLORS.omega}33`,
            maxWidth: '80%',
            transform: `scale(${1 + Math.sin(frame*0.06)*0.015})`
          }}>
            <h3 style={{ fontSize: 36, color: COLORS.omega, margin: 0, fontWeight: 900, letterSpacing: 4 }}>
              CORTEX: SUMIDERO TÉRMICO ACTIVADO
            </h3>
            <p style={{ fontSize: 26, margin: 0, marginTop: 15, color: '#F0F0F0', lineHeight: 1.4, fontFamily: 'monospace' }}>
              "📡 [Voz de sintetizador descalibrado]: El azar ha sido estabilizado en el Ledger. La exergía de los cronopios se ha condensado en un buffer circular sin fin."
            </p>
          </div>
        </AbsoluteFill>
      )}

      {/* EDDIE MORCI GOLD CARD OVERLAY (32s - 40s) */}
      {eddiePhase && (
        <AbsoluteFill style={{ 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          paddingBottom: 70, 
          zIndex: 25, 
          pointerEvents: 'none' 
        }}>
          <div style={{ 
            backdropFilter: 'blur(16px)',
            backgroundColor: 'rgba(15, 10, 0, 0.88)', 
            padding: '35px 50px', 
            border: `4px solid ${COLORS.gold}`, 
            borderRadius: '8px',
            textAlign: 'center', 
            boxShadow: `0 0 50px ${COLORS.gold}77, inset 0 0 20px ${COLORS.gold}33`,
            maxWidth: '80%',
            transform: `scale(${1 + Math.sin(frame*0.05)*0.015})`
          }}>
            <h3 style={{ fontSize: 36, color: COLORS.gold, margin: 0, fontWeight: 900, letterSpacing: 4 }}>
              EDDIE MORCI: CUÑADO SUPREMO SENTENCIA
            </h3>
            <p style={{ fontSize: 26, margin: 0, marginTop: 15, color: '#FFFAED', lineHeight: 1.4, fontFamily: 'monospace' }}>
              "🍢 [Voz de megáfono de barbacoa de domingo]: Mucha metafísica, pero al final la rayuela se borra con la lluvia. Haced el commit en la casilla 9 antes del carajillo."
            </p>
          </div>
        </AbsoluteFill>
      )}

    </AbsoluteFill>
  );
};
