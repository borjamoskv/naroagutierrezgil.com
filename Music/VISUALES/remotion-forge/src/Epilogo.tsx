import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile, random } from 'remotion';
import React from 'react';
import subtitles from './subtitles_epilogo.json';

const noiseImg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

const XokasRoomSVG = ({ frame, isSpeaking, bsod }: { frame: number, isSpeaking: boolean, bsod: boolean }) => {
  if (bsod) {
    return (
      <svg viewBox="0 0 400 300" width="100%" height="100%">
        <rect width="100%" height="100%" fill="#0000AA" />
        <text x="20" y="50" fill="#FFF" fontFamily="Courier" fontSize="12">A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +</text>
        <text x="20" y="70" fill="#FFF" fontFamily="Courier" fontSize="12">00010E36. The current application will be terminated.</text>
        <text x="20" y="100" fill="#FFF" fontFamily="Courier" fontSize="12">* Press any key to terminate the current application.</text>
        <text x="20" y="120" fill="#FFF" fontFamily="Courier" fontSize="12">* Press CTRL+ALT+DEL again to restart your computer.</text>
        <text x="150" y="200" fill="#FFF" fontFamily="Courier" fontSize="15" fontWeight="bold">RESTABLECER NORMALIDAD</text>
        <text x="170" y="220" fill="#FFF" fontFamily="Courier" fontSize="12">Error: System Halted.</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%">
      {/* 2018 Streamer Lighting */}
      <rect x="0" y="0" width="400" height="300" fill="#0A0A15" />
      <circle cx="200" cy="150" r="150" fill="url(#blue-led)" opacity="0.3" />
      <defs>
        <radialGradient id="blue-led">
          <stop offset="0%" stopColor="#0000FF" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Chaotic Background */}
      <rect x="50" y="50" width="80" height="120" fill="#222" /> {/* Posters / acoustic foam */}
      <rect x="270" y="80" width="100" height="60" fill="#333" /> {/* Shelves */}
      
      {/* Gamer Chair */}
      <path d="M 170 100 L 230 100 L 240 200 L 160 200 Z" fill="#000" />
      <path d="M 180 80 L 220 80 L 230 100 L 170 100 Z" fill="#FF0000" />

      {/* El Xokas */}
      <g transform={`translate(0, ${isSpeaking ? Math.sin(frame)*2 : 0})`}>
        <circle cx="200" cy="90" r="20" fill="#FFDAB9" />
        <rect x="180" y="110" width="40" height="60" fill="#111" /> {/* Black Tshirt */}
        <path d="M 185 75 Q 200 60 215 75" stroke="#333" strokeWidth="3" fill="none" /> {/* Hair / Headphones */}
        <rect x="175" y="80" width="10" height="15" fill="#555" />
        <rect x="215" y="80" width="10" height="15" fill="#555" />
        {/* Face */}
        <circle cx="192" cy="85" r="2" fill="#000" />
        <circle cx="208" cy="85" r="2" fill="#000" />
        <path d="M 195 95 L 205 95" stroke="#000" strokeWidth="1" /> {/* Staring expression */}
      </g>
    </svg>
  );
};

const BuyoSVG = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="50" r="40" fill="#FFDAB9" />
    <path d="M 20 40 Q 50 10 80 40" stroke="#000" strokeWidth="5" fill="none" /> {/* Hairline */}
    <circle cx="35" cy="45" r="5" fill="#000" />
    <circle cx="65" cy="45" r="5" fill="#000" />
    <path d="M 40 65 Q 50 75 60 65" stroke="#000" strokeWidth="3" fill="none" />
  </svg>
);

const KaseOScratchSVG = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `hue-rotate(${frame*5}deg)` }}>
    <rect x="20" y="40" width="60" height="60" fill="#111" rx="5" />
    <circle cx="50" cy="30" r="20" fill="#FFDAB9" />
    <path d="M 30 25 Q 50 -5 70 25 Z" fill="#333" /> {/* Beanie */}
    {/* Scratching action */}
    <circle cx="50" cy="70" r="15" fill="#333" transform={`translate(${Math.sin(frame*2)*5}, 0)`} />
    <path d="M 35 60 L 65 80" stroke="#FFF" strokeWidth="2" />
  </svg>
);

export const Epilogo: React.FC = () => {
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

  const isXokas = activeSubtitle?.avatar === 'xokas';
  const isSalchicha = activeSubtitle?.avatar === 'salchicha_triste';
  const isBuyo = activeSubtitle?.avatar === 'buyo';
  const isKaseo = activeSubtitle?.avatar === 'kaseo';
  
  // Timing logic for the Blue Screen / End
  const bsodStartMs = 28000; // After KaseO says his line
  const endStreamMs = 32000;
  
  const isBSOD = currentTimeMs > bsodStartMs && currentTimeMs < endStreamMs;
  const isEnded = currentTimeMs >= endStreamMs;

  if (isEnded) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Audio src={staticFile('epilogo.wav')} />
        <div style={{ color: '#FFF', fontFamily: 'Courier', fontSize: '30px' }}>
          CHAT: desconectado.
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ 
        backgroundColor: '#0A0A0A', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        overflow: 'hidden'
    }}>
      <Audio src={staticFile('epilogo.wav')} />
      
      {/* 4K Cinematic Noise Overlay */}
      <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url("${noiseImg}")`,
          opacity: 0.2,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          zIndex: 9999
      }} />

      {/* Twitch-style Chat scrolling on the right */}
      {!isBSOD && (
        <div style={{
          position: 'absolute', right: 20, top: 20, width: 300, height: '90%', 
          backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid #333',
          display: 'flex', flexDirection: 'column-reverse', overflow: 'hidden',
          padding: '10px', color: '#CCC', fontFamily: 'sans-serif', fontSize: '14px'
        }}>
          {Array.from({ length: 20 }).map((_, i) => (
             <div key={i} style={{ marginBottom: 5, opacity: 1 - (i*0.05) }}>
               <span style={{ fontWeight: 'bold', color: `hsl(${random(`color-${frame-i}`)*360}, 80%, 60%)` }}>
                 User{Math.floor(random(`user-${frame-i}`)*9999)}:
               </span> {isBuyo ? "BUYO???" : (isXokas ? "LMAO" : "KEKW")}
             </div>
          ))}
        </div>
      )}

      {/* Main Room */}
      <div style={{ width: '100%', height: '100%', zIndex: 10, filter: isBSOD ? 'none' : `contrast(1.1) brightness(0.9)` }}>
         <XokasRoomSVG frame={frame} isSpeaking={isXokas} bsod={isBSOD} />
      </div>

      {/* Cameos */}
      {isBuyo && !isBSOD && (
        <div style={{ position: 'absolute', left: '10%', top: '30%', width: 300, height: 300, filter: 'sepia(0.8) contrast(1.5)' }}>
          <BuyoSVG frame={frame} />
        </div>
      )}

      {isKaseo && !isBSOD && (
        <div style={{ position: 'absolute', left: '5%', bottom: '10%', width: 300, height: 300 }}>
          <KaseOScratchSVG frame={frame} />
        </div>
      )}

      {/* Subtitles */}
      {activeSubtitle && !isBSOD && (
        <div style={{
          position: 'absolute',
          bottom: 50,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '20px 40px',
          borderRadius: 10,
          color: isBuyo ? '#FFF' : '#FFF',
          fontSize: '40px',
          fontFamily: isBuyo ? 'Times New Roman, serif' : 'Arial, sans-serif',
          fontWeight: 'normal',
          textAlign: 'center',
          maxWidth: '60%',
          zIndex: 20,
          borderLeft: isXokas ? '5px solid #0000FF' : 'none',
          transform: `translateY(${interpolate(subtitleSpring, [0, 1], [20, 0], { extrapolateRight: 'clamp' })}px)`,
        }}>
          {activeSubtitle.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
