import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, interpolate, spring, random, staticFile } from 'remotion';
import React from 'react';
import subtitles from './subtitles_acto9.json';

const noiseImg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

// Arcade Machine "Paco Tragaperras"
const ArcadeSVG = ({ frame, isSpeaking }: { frame: number, isSpeaking: boolean }) => (
  <svg viewBox="0 0 200 300" width="100%" height="100%" style={{ filter: isSpeaking ? 'drop-shadow(0 0 30px #FF00FF)' : 'drop-shadow(0 0 10px #000)' }}>
    <rect x="30" y="20" width="140" height="260" fill="#222" rx="10" stroke="#FF00FF" strokeWidth="5" />
    <rect x="40" y="40" width="120" height="90" fill="#0A0A0A" />
    <text x="50" y="80" fill="#00FFFF" fontFamily="Courier" fontSize="15" fontWeight="bold">INSERT COIN</text>
    {/* Screen Glitch */}
    {isSpeaking && <rect x={40 + random(`g-${frame}`)*10} y={40 + random(`g2-${frame}`)*70} width="100" height="10" fill="#FF00FF" opacity="0.5" />}
    <rect x="30" y="140" width="140" height="40" fill="#444" transform="skewX(-20)" />
    {/* Joystick & Buttons */}
    <circle cx="60" cy="155" r="15" fill="#FF0000" />
    <circle cx="120" cy="160" r="10" fill="#00FF00" />
    <circle cx="150" cy="160" r="10" fill="#0000FF" />
    {/* Coin Slot */}
    <rect x="80" y="220" width="40" height="40" fill="#555" />
    <rect x="95" y="230" width="10" height="20" fill="#111" />
    {/* Coin / Carajillo popping out */}
    {isSpeaking && (
      <circle cx="100" cy="240" r="10" fill="#FFD700" transform={`translate(0, ${Math.sin(frame)*10})`} />
    )}
  </svg>
);

// Chimo in Megane
const ChimoMeganeSVG = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 300 200" width="100%" height="100%" style={{ transform: `translate(${Math.sin(frame/5)*10}px, ${Math.cos(frame/5)*10}px)` }}>
    {/* Megane */}
    <rect x="20" y="100" width="260" height="60" fill="#FFFF00" rx="20" />
    <path d="M 50 100 L 80 50 L 220 50 L 250 100 Z" fill="#333" />
    <circle cx="80" cy="160" r="25" fill="#111" />
    <circle cx="80" cy="160" r="10" fill="#FFF" />
    <circle cx="220" cy="160" r="25" fill="#111" />
    <circle cx="220" cy="160" r="10" fill="#FFF" />
    {/* Chimo sticking out */}
    <circle cx="150" cy="40" r="20" fill="#FFDAB9" />
    <rect x="135" y="30" width="30" height="10" fill="#000" /> {/* Sunglasses */}
    <text x="125" y="20" fill="#FF00FF" fontFamily="Arial" fontSize="15" fontWeight="bold">HU-HA!</text>
  </svg>
);

export const Acto9Recreativas: React.FC = () => {
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
  const subtitleScale = interpolate(subtitleSpring, [0, 1], [0.85, 1.0], { extrapolateRight: 'clamp' });
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
  
  const isChimo = activeSubtitle?.avatar === 'chimo_megane';
  const isArcades = activeSubtitle?.avatar === 'maquinas' || activeSubtitle?.avatar === 'recreativas_bakalao' || activeSubtitle?.avatar === 'paco_tragaperras';
  const isVozImposible = activeSubtitle?.avatar === 'voz_imposible';
  
  return (
    <AbsoluteFill style={{ 
        backgroundColor: '#0A0A0A', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        overflow: 'hidden'
    }}>
      <Audio src={staticFile('acto9_recreativas.wav')} />
      
      {/* 4K Cinematic Noise Overlay */}
      <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url("${noiseImg}")`,
          opacity: 0.15,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          zIndex: 9999
      }} />

      {/* Cyberpunk Grid Background */}
      <div style={{
        position: 'absolute',
        top: '50%', left: 0, width: '100%', height: '50%',
        backgroundImage: 'linear-gradient(transparent 90%, #FF00FF 90%), linear-gradient(90deg, transparent 90%, #FF00FF 90%)',
        backgroundSize: '100px 100px',
        transform: `perspective(500px) rotateX(70deg) translateY(${-frame*10 % 100}px)`,
        opacity: 0.5,
        zIndex: 0
      }} />
      
      {/* Laser beams / Dancefloor lighting */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', width: '2px', height: '100%',
        backgroundColor: '#00FFFF',
        transform: `rotate(${Math.sin(frame/20)*40}deg)`,
        transformOrigin: 'top',
        opacity: 0.6,
        boxShadow: '0 0 20px #00FFFF',
        zIndex: 1
      }} />

      {/* Main Action Area */}
      <div style={{ zIndex: 10, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {isChimo ? (
          <div style={{ width: 800, height: 600 }}>
            <ChimoMeganeSVG frame={frame} />
          </div>
        ) : (
          <div style={{ width: 600, height: 800, transform: isVozImposible ? `scale(${1 + frame/200}) rotate(${frame/5}deg)` : 'none' }}>
            <ArcadeSVG frame={frame} isSpeaking={isArcades || isVozImposible} />
          </div>
        )}

      </div>

      {/* Loading Bar for Carajilloverse */}
      {isVozImposible && (
         <div style={{ position: 'absolute', top: '20%', width: '60%', height: '30px', border: '5px solid #FF00FF', zIndex: 50 }}>
            <div style={{ width: `${Math.min(100, (frame/100)*100)}%`, height: '100%', backgroundColor: '#00FFFF' }} />
         </div>
      )}

      {/* Subtitles */}
      {activeSubtitle && (
        <div style={{
          position: 'absolute',
          bottom: 100,
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          padding: '20px 40px',
          borderRadius: 20,
          color: isVozImposible ? '#FFF' : '#FF00FF',
          fontSize: '50px',
          fontFamily: 'Courier New, monospace',
          fontWeight: 'bold',
          textAlign: 'center',
          maxWidth: '80%',
          zIndex: 20,
          boxShadow: `0 0 30px ${isVozImposible ? '#FFF' : '#FF00FF'}`,
          transform: `translateY(${subtitleY}px) scale(${subtitleScale})`,
          opacity: subtitleOpacity,
        }}>
          {activeSubtitle.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
