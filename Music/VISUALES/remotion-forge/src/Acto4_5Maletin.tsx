import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, interpolate, spring, random, staticFile } from 'remotion';
import React from 'react';
import subtitles from './subtitles_acto4_5.json';

const noiseImg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

// Flying glowing Carajillo
const CarajilloSVG = ({ frame, isWhispering }: { frame: number, isWhispering: boolean }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ 
    transform: `rotate(${frame * 5}deg) scale(${1 + Math.sin(frame/5)*0.2})`,
    filter: isWhispering ? 'drop-shadow(0 0 30px #00FFFF) invert(1)' : 'drop-shadow(0 0 10px #FFD700)'
  }}>
    <path d="M 20 40 Q 50 20 80 40 L 70 80 L 30 80 Z" fill="#8B4513" stroke="#FFD700" strokeWidth="3" />
    <path d="M 80 40 C 100 40 100 60 75 60" fill="none" stroke="#FFD700" strokeWidth="3" />
    <circle cx="45" cy="35" r="5" fill="#FFF" opacity={0.8 + Math.sin(frame/2)*0.2} />
    <circle cx="55" cy="30" r="8" fill="#FFF" opacity={0.7 + Math.cos(frame/3)*0.3} />
  </svg>
);

const ChimoGiganteSVG = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ transform: `scale(${1 + Math.sin(frame/10)*0.05})` }}>
    <circle cx="100" cy="100" r="80" fill="#FFDAB9" />
    <rect x="40" y="70" width="120" height="30" fill="#000" rx="10" />
    <rect x="50" y="70" width="40" height="30" fill="#FF00FF" />
    <rect x="110" y="70" width="40" height="30" fill="#00FFFF" />
    <text x="65" y="160" fill="#000" fontFamily="Arial" fontSize="40" fontWeight="bold">HU-HA</text>
  </svg>
);

const KaseOSVG = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ transform: `scale(${1 + Math.sin(frame/10)*0.1}) translateY(${Math.cos(frame/5)*10}px)` }}>
    {/* Body */}
    <rect x="70" y="100" width="60" height="80" fill="#1A1A1A" rx="10" />
    <path d="M 60 100 Q 100 120 140 100 L 130 180 L 70 180 Z" fill="#000" />
    {/* Head */}
    <circle cx="100" cy="70" r="30" fill="#FFDAB9" />
    {/* Cap/Beanie */}
    <path d="M 65 65 Q 100 20 135 65 Z" fill="#333" />
    {/* Face */}
    <circle cx="85" cy="70" r="4" fill="#000" />
    <circle cx="115" cy="70" r="4" fill="#000" />
    <path d="M 85 85 Q 100 95 115 85" stroke="#000" strokeWidth="2" fill="none" />
    {/* Mic */}
    <rect x="120" y="110" width="10" height="30" fill="#555" transform="rotate(-30 120 110)" />
    <circle cx="115" cy="100" r="10" fill="#888" />
    {/* Lyrics Bubble */}
    <path d="M 130 80 Q 180 50 180 20 Q 150 -10 130 20 Q 140 50 130 80 Z" fill="#FFF" stroke="#000" />
    <text x="135" y="30" fill="#000" fontFamily="Impact" fontSize="12" fontWeight="bold">EL GORDO QUE</text>
    <text x="135" y="45" fill="#000" fontFamily="Impact" fontSize="12" fontWeight="bold">LA PISA BIEN</text>
    {/* La Salchicha Peleona */}
    <g transform={`translate(${Math.sin(frame)*10 - 20}, ${Math.cos(frame)*10 + 100})`}>
      <path d="M 0 40 Q 20 0 40 40 Q 20 80 0 40 Z" fill="#FF6347" stroke="#8B0000" strokeWidth="3" />
      <circle cx="15" cy="35" r="3" fill="#FFF" />
      <circle cx="15" cy="35" r="1" fill="#000" />
      <circle cx="25" cy="35" r="3" fill="#FFF" />
      <circle cx="25" cy="35" r="1" fill="#000" />
      {/* Boxing Gloves */}
      <circle cx="0" cy="50" r="8" fill="#FF0000" />
      <circle cx="40" cy="50" r="8" fill="#FF0000" />
      {/* Angry eyebrows */}
      <path d="M 10 30 L 18 33 M 30 30 L 22 33" stroke="#000" strokeWidth="2" />
    </g>
  </svg>
);

export const Acto4_5Maletin: React.FC = () => {
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

  const isChimoGigante = activeSubtitle?.avatar === 'chimo_gigante';
  const isCarajillo = activeSubtitle?.avatar === 'carajillo';
  const isFijoman = activeSubtitle?.avatar === 'fijoman';
  
  // Fast cuts for Guy Ritchie montage (change background color every 10 frames if not in a specific scene)
  const isMontage = activeSubtitle?.avatar === 'narrator';
  const bgColors = ['#0A0A0A', '#8B0000', '#00008B', '#006400', '#8B4500'];
  const currentBgColor = isMontage ? bgColors[Math.floor(frame / 10) % bgColors.length] : '#0A0A0A';

  // Subtitles running away from screen logic
  const isFinal = isChimoGigante || activeSubtitle?.avatar === 'pablo';
  const escapeX = isFinal ? 0 : (isFijoman ? (random(`sub-x-${frame}`)-0.5)*500 : 0);
  const escapeY = isFinal ? 0 : (isFijoman ? (random(`sub-y-${frame}`)-0.5)*500 : interpolate(subtitleSpring, [0, 1], [30, 0], { extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill style={{ 
        backgroundColor: currentBgColor, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        overflow: 'hidden'
    }}>
      <Audio src={staticFile('acto4_5_maletin.wav')} />
      
      {/* 4K Cinematic Noise Overlay */}
      <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url("${noiseImg}")`,
          opacity: 0.15,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          zIndex: 9999
      }} />

      {/* Main Action Area */}
      <div style={{ zIndex: 10, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {isChimoGigante ? (
          <div style={{ width: 1000, height: 1000 }}>
            <ChimoGiganteSVG frame={frame} />
          </div>
        ) : (
          <div style={{ width: 400, height: 400, transform: `translate(${Math.sin(frame/10)*100}px, ${Math.cos(frame/10)*100}px)` }}>
             <CarajilloSVG frame={frame} isWhispering={isCarajillo} />
          </div>
        )}

        {/* Kase.O y Salchicha Peleona Random Gag during the montage */}
        {isMontage && (
          <div style={{ width: 300, height: 300, position: 'absolute', right: '10%', bottom: '20%' }}>
            <KaseOSVG frame={frame} />
          </div>
        )}

      </div>

      {/* Subtitles */}
      {activeSubtitle && (
        <div style={{
          position: 'absolute',
          bottom: 100,
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          padding: '20px 40px',
          borderRadius: 20,
          color: isCarajillo ? '#00FFFF' : (isChimoGigante ? '#FF00FF' : '#FFF'),
          fontSize: isCarajillo ? '60px' : '50px',
          fontFamily: isCarajillo ? 'Courier New, monospace' : 'Impact, sans-serif',
          fontWeight: isCarajillo ? 'bold' : 'normal',
          textAlign: 'center',
          maxWidth: '80%',
          zIndex: 20,
          boxShadow: `0 0 30px ${isCarajillo ? '#00FFFF' : '#2B3BE5'}`,
          transform: `translate(${escapeX}px, ${escapeY}px)`,
        }}>
          {activeSubtitle.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
