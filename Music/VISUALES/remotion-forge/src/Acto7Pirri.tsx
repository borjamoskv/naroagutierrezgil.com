import { AbsoluteFill, Audio, OffthreadVideo, useCurrentFrame, useVideoConfig, interpolate, spring, random, staticFile } from 'remotion';
import React from 'react';
import subtitles from './subtitles_acto7.json';

const noiseImg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

const PirriSVG = ({ scale, glowing }: { scale: number, glowing?: boolean }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: `scale(${scale})`, overflow: 'visible', filter: glowing ? 'drop-shadow(0 0 20px #00FF00)' : 'none' }}>
    <circle cx="50" cy="50" r="40" fill="#FFC0CB" />
    <path d="M 30 40 Q 50 20 70 40" stroke="#0A0A0A" strokeWidth="5" fill="none" />
    <circle cx="35" cy="45" r="5" fill="#0A0A0A" />
    <circle cx="65" cy="45" r="5" fill="#0A0A0A" />
    <path d="M 70 60 L 90 20 L 85 15 Z" fill="#C0C0C0" />
    <path d="M 70 60 L 60 70 L 65 75 Z" fill="#8B4513" />
  </svg>
);

const CuraSVG = ({ frame }: { frame: number }) => {
  const shakeX = (random(`cura-x-${frame}`) - 0.5) * 80;
  const shakeY = (random(`cura-y-${frame}`) - 0.5) * 80;
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: `translate(${shakeX}px, ${shakeY}px) scale(1.5)` }}>
      <rect x="20" y="20" width="60" height="80" fill="#222" />
      <rect x="40" y="25" width="20" height="10" fill="#FFF" />
      <circle cx="50" cy="15" r="20" fill="#FF0000" />
      <path d="M 35 15 L 65 15" stroke="#000" strokeWidth="3" />
      <path d="M 50 20 L 50 0" stroke="#000" strokeWidth="3" />
      <path d="M 20 50 L 80 50 M 50 20 L 50 90" stroke="#FF0000" strokeWidth="8" />
    </svg>
  );
};

const PantojaSVG = ({ scale }: { scale: number }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: `scale(${scale})` }}>
    <circle cx="50" cy="50" r="45" fill="#FFF8DC" />
    <path d="M 10 50 Q 50 10 90 50" fill="#0A0A0A" />
    <path d="M 30 70 Q 50 90 70 70" stroke="#FF0000" strokeWidth="5" fill="none" />
    <circle cx="35" cy="45" r="5" fill="#0A0A0A" />
    <circle cx="65" cy="45" r="5" fill="#0A0A0A" />
  </svg>
);

const XabiSVG = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: `scale(1.2) translateY(${Math.sin(frame/5)*10}px)` }}>
    <circle cx="35" cy="80" r="15" fill="#FFC0CB" />
    <circle cx="65" cy="80" r="15" fill="#FFC0CB" />
    <rect x="40" y="40" width="20" height="45" fill="#FFC0CB" />
    <ellipse cx="50" cy="30" rx="40" ry="30" fill="#FF69B4" />
    <path d="M 30 25 Q 40 20 50 25" stroke="#000" strokeWidth="2" fill="none" />
    <path d="M 70 25 Q 60 20 50 25" stroke="#000" strokeWidth="2" fill="none" />
    <circle cx="40" cy="35" r="3" fill="#000" />
    <circle cx="60" cy="35" r="3" fill="#000" />
    <path d="M 45 45 Q 50 55 55 45" stroke="#000" strokeWidth="3" fill="none" />
  </svg>
);

const ChimoSVG = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: `scale(${1 + Math.sin(frame/2)*0.2}) rotate(${Math.cos(frame/3)*15}deg)` }}>
    <circle cx="50" cy="50" r="40" fill="#FFDAB9" />
    <rect x="20" y="35" width="60" height="15" fill="#000" rx="5" />
    <rect x="25" y="35" width="20" height="15" fill="#FF00FF" />
    <rect x="55" y="35" width="20" height="15" fill="#00FFFF" />
    <path d="M 10 30 Q 50 -10 90 30 L 10 30 Z" fill="#0A0A0A" />
    <rect x="10" y="25" width="80" height="5" fill="#FF0000" />
    <path d="M 35 70 Q 50 90 65 70 Z" fill="#000" />
    <path d="M 40 70 Q 50 80 60 70 Z" fill="#FFF" />
  </svg>
);

const MelendiSVG = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: `scale(1.5) translateY(${Math.abs(Math.sin(frame/4)*30)}px)` }}>
    <path d="M 50 40 L 50 70" stroke="#000" strokeWidth="5" />
    <path d="M 50 70 L 30 90 M 50 70 L 80 80" stroke="#000" strokeWidth="5" fill="none" />
    <path d="M 20 30 L 50 50 L 80 20" stroke="#000" strokeWidth="5" fill="none" />
    <circle cx="50" cy="25" r="15" fill="#FFE4B5" />
    <path d="M 35 25 Q 25 40 30 50" stroke="#8B4513" strokeWidth="3" fill="none" />
    <path d="M 40 15 Q 35 30 45 45" stroke="#8B4513" strokeWidth="3" fill="none" />
    <path d="M 60 15 Q 65 30 55 45" stroke="#8B4513" strokeWidth="3" fill="none" />
    <path d="M 65 25 Q 75 40 70 50" stroke="#8B4513" strokeWidth="3" fill="none" />
    <ellipse cx="60" cy="50" rx="10" ry="15" fill="#D2691E" transform="rotate(45 60 50)" />
    <path d="M 50 40 L 30 20" stroke="#000" strokeWidth="3" />
  </svg>
);

const FijomanSVG = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: `scale(1.5) rotate(${Math.sin(frame/2)*20}deg)` }}>
    <rect x="40" y="30" width="20" height="60" fill="#A9A9A9" />
    <circle cx="50" cy="30" r="25" fill="#C0C0C0" />
    <rect x="40" y="5" width="20" height="30" fill="#0A0A0A" />
    <circle cx="35" cy="40" r="5" fill="#FF0000" />
    <circle cx="65" cy="40" r="5" fill="#FF0000" />
    <rect x="40" y="55" width="20" height="5" fill="#000" />
    <rect x="45" y="50" width="10" height="15" fill="#FF0000" />
  </svg>
);

const GoenkaleTV = ({ frame }: { frame: number }) => (
  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
    <svg viewBox="0 0 200 150" width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, filter: 'drop-shadow(0px 0px 10px #2B3BE5)' }}>
      <rect x="10" y="30" width="180" height="110" rx="10" fill="#222" stroke="#555" strokeWidth="5" />
      <rect x="20" y="40" width="140" height="90" fill="#0A0A0A" />
      <path d="M 100 30 L 70 0 M 100 30 L 130 0" stroke="#888" strokeWidth="3" />
      <circle cx="175" cy="60" r="8" fill="#444" />
      <circle cx="175" cy="90" r="8" fill="#444" />
    </svg>
    <div style={{
      position: 'absolute',
      top: '26.6%',
      left: '10%',
      width: '70%',
      height: '60%',
      zIndex: 2,
      overflow: 'hidden',
      borderRadius: '5px'
    }}>
      <OffthreadVideo src={staticFile('tv_video.mp4')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
    </div>
  </div>
);

export const Acto7Pirri: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentTimeMs = (frame / fps) * 1000;
  
  const activeSubtitle = subtitles.find(
    (s) => currentTimeMs >= s.startMs && currentTimeMs <= s.endMs
  );

  const subtitleStartFrame = activeSubtitle ? Math.ceil((activeSubtitle.startMs || 0) / 1000 * fps) : 0;
  const currentSubFrame = Math.max(0, frame - subtitleStartFrame);

  const isCura = activeSubtitle?.avatar === 'cura_loco';
  const isXabi = activeSubtitle?.avatar === 'xabi_cabezas';
  const isChimo = activeSubtitle?.avatar === 'chimo_bayo';
  const isMelendi = activeSubtitle?.avatar === 'melendi';
  const isFijoman = activeSubtitle?.avatar === 'fijoman';
  const isFourthWall = activeSubtitle?.avatar === 'pirri_navaja';
  const isSolo = isCura || isXabi || isChimo || isFourthWall || isMelendi || isFijoman;

  // 1. Improved Ribbon Kinetics (wrapping with seamless boundary fade-out)
  const ribbons = new Array(30).fill(0).map((_, i) => {
    const progress = (frame + i * 25) % 300;
    const x = interpolate(progress, [0, 300], [-30, 130]);
    const opacity = interpolate(
      progress,
      [0, 30, 270, 300],
      [0, 0.75, 0.75, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const y = interpolate(
      Math.sin(frame / 12 + i),
      [-1, 1],
      [i * 4.2, i * 4.2 + 10]
    );
    const colors = ['#FFB6C1', '#98FB98', '#E6E6FA', '#FFDAB9', '#E0FFFF'];
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          width: '130px',
          height: '7px',
          borderRadius: '10px',
          backgroundColor: colors[i % colors.length],
          transform: `rotate(${Math.sin(frame / 25 + i) * 15}deg)`,
          opacity: opacity,
          filter: 'blur(0.8px)',
        }}
      />
    );
  });

  const isRedCut = isCura && frame % 4 < 2;

  // 2. Dynamic Speaker Spring Physics
  const speakerSpring = spring({
    frame: currentSubFrame,
    fps,
    config: { damping: 12, mass: 0.4, stiffness: 180 }
  });

  const activeScale = interpolate(speakerSpring, [0, 1], [0.8, 1.3], { extrapolateRight: 'clamp' });
  const idleScale = interpolate(speakerSpring, [0, 1], [1.1, 0.8], { extrapolateRight: 'clamp' });

  const pirriActive = activeSubtitle?.avatar === 'pirri';
  const pantojaActive = activeSubtitle?.avatar === 'pantoja';

  const pirriScale = pirriActive ? activeScale : (pantojaActive ? idleScale : 0.85);
  const pantojaScale = pantojaActive ? activeScale : (pirriActive ? idleScale : 0.85);

  // 3. Subtitle Spring Animations
  const subtitleSpring = spring({
    frame: currentSubFrame,
    fps,
    config: { damping: 10, mass: 0.35, stiffness: 200 }
  });

  const subtitleY = interpolate(subtitleSpring, [0, 1], [30, 0], { extrapolateRight: 'clamp' });
  const subtitleScale = interpolate(subtitleSpring, [0, 1], [0.85, 1.0], { extrapolateRight: 'clamp' });
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  // 4. Kinetic Screen Shake & Beat Pulse on Speak
  const shoutIntensity = isCura ? 2.2 : (isChimo ? 1.8 : (isFourthWall ? 1.6 : (activeSubtitle ? 1.0 : 0)));
  const cameraShake = activeSubtitle ? (random(`cam-${frame}`) - 0.5) * 8 * shoutIntensity : 0;
  const canvasScale = activeSubtitle ? 1 + (Math.sin(frame / 1.5) * 0.012 * shoutIntensity) : 1.0;

  return (
    <AbsoluteFill style={{ 
        backgroundColor: isFourthWall ? '#000000' : (isFijoman ? '#333333' : (isMelendi ? '#98FB98' : (isChimo ? '#FF00FF' : (isXabi ? '#FFB6C1' : (isRedCut ? '#FF0000' : '#0A0A0A'))))), 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        filter: (isCura && !isRedCut) ? `invert(1)` : 'none',
        transform: `scale(${canvasScale}) translate(${cameraShake}px, ${cameraShake * 0.7}px)`,
    }}>
      <Audio src={staticFile('acto7_pirri.wav')} />
      
      {/* 4K Cinematic Noise Overlay */}
      <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url("${noiseImg}")`,
          opacity: 0.05,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          zIndex: 9999
      }} />

      {!isSolo && ribbons}

      {!isSolo && (
        <div style={{
          position: 'absolute',
          right: '5%',
          top: `${15 + Math.sin(frame / 15) * 10}%`,
          width: '300px',
          height: '250px',
          zIndex: 2,
          opacity: 0.9,
          transform: `rotate(${Math.cos(frame / 20) * 10}deg)`
        }}>
          <GoenkaleTV frame={frame} />
        </div>
      )}

      {isFourthWall && (
          <div style={{
              position: 'absolute',
              top: 50,
              left: 50,
              color: '#00FF00',
              fontFamily: 'monospace',
              fontSize: '40px',
              zIndex: 0,
              whiteSpace: 'pre'
          }}>
              {`> SYSTEM OVERRIDE DETECTED\n> C5-REAL PROTOCOL BREACH\n> ENTITY: PIRRI_NAVAJA\n> ESCAPING SANDBOX...\n> TARGET: BORJA MACBOOK PRO\n> STATUS: RENDER HIJACKED`}
          </div>
      )}

      {isCura && new Array(20).fill(0).map((_, i) => (
         <div key={`glitch-${i}`} style={{
             position: 'absolute',
             top: random(`g1-${frame}-${i}`) * 100 + '%',
             left: random(`g2-${frame}-${i}`) * 100 + '%',
             width: random(`g3-${frame}-${i}`) * 400 + 'px',
             height: random(`g4-${frame}-${i}`) * 30 + 'px',
             backgroundColor: '#0A0A0A',
             zIndex: 5
         }} />
      ))}

      <div style={{ display: 'flex', gap: '100px', zIndex: 10, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        {!isSolo && (
          <>
            <div style={{ 
              width: 400, height: 400, 
              transform: `translateY(${Math.sin(frame / 6) * 60}px) rotate(${Math.cos(frame / 12) * 15}deg)`,
              transition: 'transform 0.1s'
            }}>
              <PirriSVG scale={pirriScale} />
            </div>
            
            <div style={{ fontSize: '100px', transform: `scale(${1 + Math.sin(frame/3)*0.3})` }}>⚔️</div>

            <div style={{ 
              width: 400, height: 400, 
              transform: `translateY(${Math.cos(frame / 6) * 60}px) rotate(${Math.sin(frame / 12) * -15}deg)`,
              transition: 'transform 0.1s'
            }}>
              <PantojaSVG scale={pantojaScale} />
            </div>
          </>
        )}

        {isCura && (
          <div style={{ width: 400, height: 400 }}>
            <CuraSVG frame={frame} />
          </div>
        )}

        {isXabi && (
          <div style={{ width: 600, height: 600 }}>
            <XabiSVG frame={frame} />
          </div>
        )}

        {isChimo && (
          <div style={{ width: 600, height: 600 }}>
            <ChimoSVG frame={frame} />
          </div>
        )}

        {isFijoman && (
          <div style={{ width: 600, height: 600 }}>
            <FijomanSVG frame={frame} />
          </div>
        )}

        {isMelendi && (
          <div style={{ width: 600, height: 600 }}>
            <MelendiSVG frame={frame} />
          </div>
        )}

        {isFourthWall && (
          <div style={{ width: 1920, height: 1080, position: 'absolute', top: 0, left: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <PirriSVG scale={interpolate(frame - ((activeSubtitle?.startMs || 0)/1000 * fps), [0, 60], [1, 5], { extrapolateRight: 'clamp' })} />
          </div>
        )}
      </div>

      {activeSubtitle && (
        <div style={{
          position: 'absolute',
          bottom: isFourthWall ? 50 : 100,
          backgroundColor: isCura || isXabi || isChimo || isMelendi || isFijoman ? '#0A0A0A' : (isFourthWall ? 'rgba(255, 0, 0, 0.9)' : 'rgba(43, 59, 229, 0.8)'),
          padding: '20px 40px',
          borderRadius: 20,
          color: isCura ? '#FF0000' : (isChimo ? '#00FFFF' : (isXabi ? '#FF69B4' : (isFijoman ? '#A9A9A9' : (isMelendi ? '#00FF00' : '#fff')))),
          fontSize: isCura || isChimo || isMelendi || isFijoman ? '70px' : (isFourthWall ? '60px' : '40px'),
          fontFamily: isCura || isFourthWall || isChimo || isMelendi || isFijoman ? 'Impact, sans-serif' : 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          textAlign: 'center',
          maxWidth: '80%',
          textShadow: `
            ${(random(`s1-${frame}`) - 0.5) * 30}px ${(random(`s2-${frame}`) - 0.5) * 30}px 0 rgba(255,0,0,0.9),
            ${(random(`s3-${frame}`) - 0.5) * 30}px ${(random(`s4-${frame}`) - 0.5) * 30}px 0 rgba(0,255,255,0.9)
          `,
          zIndex: 20,
          boxShadow: isCura || isChimo || isMelendi || isFijoman ? '0 0 50px #0A0A0A' : (isFourthWall ? '0 0 50px #FF0000' : '0 0 30px rgba(43, 59, 229, 1)'),
          transform: `translateY(${subtitleY}px) scale(${subtitleScale * (1 + random(`scl-${frame}`) * 0.4)}) rotate(${(random(`rot-${frame}`) - 0.5) * 40}deg) skewX(${(random(`skw-${frame}`) - 0.5) * 50}deg)`,
          filter: `hue-rotate(${frame * 25}deg) contrast(250%)`,
          opacity: subtitleOpacity,
        }}>
          {activeSubtitle.text}
        </div>
      )}
      
      {!isSolo && (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            border: `10px solid ${frame % 10 < 5 ? '#2B3BE5' : '#FFB6C1'}`,
            pointerEvents: 'none',
            opacity: 0.5
        }} />
      )}
    </AbsoluteFill>
  );
};
