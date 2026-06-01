import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, interpolate, spring, random, staticFile } from 'remotion';
import React from 'react';
import subtitles from './subtitles_acto10.json';

const noiseImg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

// Ancient Carajillo artifact
const CarajilloMythicSVG = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ filter: 'drop-shadow(0 0 30px #FFD700)' }}>
    <circle cx="100" cy="100" r="80" fill="none" stroke="#FFD700" strokeWidth="2" strokeDasharray="5,5" transform={`rotate(${frame/2} 100 100)`} />
    <circle cx="100" cy="100" r="95" fill="none" stroke="#FFD700" strokeWidth="1" transform={`rotate(${-frame/3} 100 100)`} />
    <path d="M 60 80 Q 100 40 140 80 L 120 160 L 80 160 Z" fill="#8B4513" stroke="#FFD700" strokeWidth="5" />
    <path d="M 140 80 C 180 80 180 120 135 120" fill="none" stroke="#FFD700" strokeWidth="5" />
    {/* Floating Foam */}
    <circle cx="90" cy="75" r="10" fill="#FFF" opacity={0.8 + Math.sin(frame/10)*0.2} />
    <circle cx="110" cy="70" r="15" fill="#FFF" opacity={0.7 + Math.cos(frame/8)*0.3} />
  </svg>
);

const AlgoritmoSVG = ({ frame }: { frame: number }) => {
  const glitch = random(`alg-${frame}`) > 0.8 ? 20 : 0;
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <rect x={10 + glitch} y="10" width="180" height="180" fill="#2B3BE5" />
      <rect x="20" y="20" width="160" height="30" fill="#FFF" />
      <text x="30" y="42" fill="#2B3BE5" fontFamily="Arial" fontSize="18" fontWeight="bold">B-42: PROTOCOL</text>
      <path d="M 20 60 L 180 60 M 20 80 L 180 80 M 20 100 L 180 100 M 20 120 L 120 120" stroke="#FFF" strokeWidth="4" />
      <circle cx="100" cy="150" r="20" fill={frame % 10 > 5 ? '#FF0000' : '#FFF'} />
    </svg>
  );
}

export const Acto10Flashback: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;
  
  const activeSubtitle = subtitles.find(
    (s) => currentTimeMs >= s.startMs && currentTimeMs <= s.endMs
  );

  const subtitleStartFrame = activeSubtitle ? Math.ceil((activeSubtitle.startMs || 0) / 1000 * fps) : 0;
  const currentSubFrame = Math.max(0, frame - subtitleStartFrame);
  
  const subtitleSpring = spring({
    frame: currentSubFrame,
    fps,
    config: { damping: 10, mass: 0.35, stiffness: 200 }
  });

  const subtitleY = interpolate(subtitleSpring, [0, 1], [30, 0], { extrapolateRight: 'clamp' });
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
  
  const isAlgoritmo = activeSubtitle?.avatar === 'algoritmo_sentido_comun';
  const isPantoja = activeSubtitle?.avatar === 'pantoja_diosa';
  const isFijoman = activeSubtitle?.avatar === 'fijoman_llave';

  // Background color shifting
  const bgRed = interpolate(Math.sin(frame/50), [-1, 1], [10, 30]);
  const bgColor = isAlgoritmo ? '#0A0A0A' : `rgb(${bgRed}, 0, 0)`;

  // Screen shake
  const shake = isFijoman ? (random(`sh-${frame}`)-0.5)*15 : (isAlgoritmo ? (random(`sha-${frame}`)-0.5)*5 : 0);

  return (
    <AbsoluteFill style={{ 
        backgroundColor: bgColor, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        transform: `translate(${shake}px, ${shake}px)`
    }}>
      <Audio src={staticFile('acto10_flashback.wav')} />
      
      {/* 4K Cinematic Noise Overlay */}
      <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url("${noiseImg}")`,
          opacity: 0.15,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          zIndex: 9999
      }} />

      {/* Corporate Grid Overlay (only during Algoritmo) */}
      {isAlgoritmo && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'linear-gradient(#2B3BE5 1px, transparent 1px), linear-gradient(90deg, #2B3BE5 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.3,
          transform: `perspective(500px) rotateX(${60 + Math.sin(frame/10)*5}deg) translateY(${frame*5 % 50}px)`,
          zIndex: 1
        }} />
      )}

      {/* Main Visual Element */}
      <div style={{ 
          position: 'absolute', 
          width: '600px', height: '600px', 
          zIndex: 5,
          transform: `scale(${1 + Math.sin(frame/30)*0.05})`,
          transition: 'all 0.5s'
      }}>
        {isAlgoritmo ? <AlgoritmoSVG frame={frame} /> : (isFijoman ? null : <CarajilloMythicSVG frame={frame} />)}
      </div>

      {/* Fijoman The Key */}
      {isFijoman && (
        <div style={{
          position: 'absolute',
          width: '800px', height: '800px',
          zIndex: 6,
          filter: 'drop-shadow(0 0 50px #FF0000)',
          transform: `scale(${1 + Math.sin(frame/5)*0.2}) rotate(${Math.cos(frame/3)*10}deg)`
        }}>
          {/* Key silhouette representing Fijoman */}
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <path d="M 30 50 C 30 20 70 20 70 50 C 70 60 60 70 60 70 L 60 90 L 50 90 L 50 80 L 40 80 L 40 70 C 40 70 30 60 30 50 Z" fill="#FF0000" />
            <circle cx="50" cy="40" r="10" fill="#0A0A0A" />
          </svg>
        </div>
      )}

      {/* Subtitles */}
      {activeSubtitle && (
        <div style={{
          position: 'absolute',
          bottom: 150,
          backgroundColor: isAlgoritmo ? '#2B3BE5' : '#0A0A0A',
          padding: '30px 50px',
          borderRadius: 15,
          color: isAlgoritmo ? '#FFF' : '#FFD700',
          fontSize: '55px',
          fontFamily: isAlgoritmo ? 'Arial, sans-serif' : 'Times New Roman, serif',
          fontWeight: isAlgoritmo ? 'bold' : 'normal',
          textAlign: 'center',
          maxWidth: '80%',
          zIndex: 20,
          boxShadow: isAlgoritmo ? '0 0 30px #2B3BE5' : '0 0 50px #FFD700',
          border: isAlgoritmo ? '5px solid #FFF' : '2px solid #FFD700',
          transform: `translateY(${subtitleY}px)`,
          opacity: subtitleOpacity,
        }}>
          {activeSubtitle.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
