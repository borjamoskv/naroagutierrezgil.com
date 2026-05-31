import React from 'react';
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import subs from './subtitles_acto4.json';

const C = {
  bg: '#0A0A0A',
  jamon: '#8B0000',
  chiquito: '#FFD700',
  yinmn: '#2B3BE5'
};

const CaptainAmerica: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const xPos = ((frame * 6) % (width + 1000)) - 500;
  const yPos = height * 0.15 + Math.sin(frame * 0.05) * 150;
  return (
    <div style={{
      position: 'absolute', left: xPos, top: yPos, transform: `rotate(${Math.sin(frame * 0.1) * 15}deg)`,
      opacity: 0.6, zIndex: 5,
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

const SardinaGigante: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  const xPos = width + 500 - ((frame * 12) % (width + 3000));
  const yPos = height * 0.4 + Math.sin(frame * 0.1) * 200;

  return (
    <div style={{
      position: 'absolute', left: xPos, top: yPos,
      transform: `rotate(${Math.sin(frame * 0.05) * 10}deg) scale(3)`,
      opacity: 0.9, zIndex: 6,
    }}>
      <svg width="600" height="200" viewBox="0 0 600 200" style={{ filter: 'drop-shadow(0 0 30px rgba(0, 255, 255, 0.4))' }}>
        <path d="M 50 100 L 10 50 L 30 100 L 10 150 Z" fill="#87CEFA" />
        <ellipse cx="300" cy="100" rx="250" ry="60" fill="url(#sardine-grad)" />
        <circle cx="500" cy="80" r="15" fill="#FFF" />
        <circle cx="505" cy="80" r="5" fill="#000" />
        <path d="M 540 100 Q 520 110 500 110" stroke="#000" strokeWidth="4" fill="none" />
        <path d="M 200 60 Q 220 80 200 100 M 250 60 Q 270 80 250 100 M 300 60 Q 320 80 300 100 M 350 60 Q 370 80 350 100 M 400 60 Q 420 80 400 100" stroke="#4682B4" strokeWidth="5" fill="none" opacity="0.6" />
        <defs>
          <linearGradient id="sardine-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4682B4" />
            <stop offset="50%" stopColor="#E0FFFF" />
            <stop offset="100%" stopColor="#708090" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export const Acto4PazChiquito: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const sec = frame / fps;

  const currentSub = (subs as any[]).find(s => sec >= s.s && sec < s.e);
  const isChiquito = currentSub && currentSub.who === 'CHIQUITOCRES';

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <CaptainAmerica />
      <SardinaGigante />
      
      {/* Earthquake effect when Chiquitocres speaks */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        transform: isChiquito ? `translate(${(Math.random()-0.5)*50}px, ${(Math.random()-0.5)*50}px)` : 'none',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}>
        {isChiquito && (
          <div style={{
            color: C.chiquito, fontSize: 300, fontWeight: 900, fontFamily: 'monospace',
            textShadow: `0 0 100px ${C.jamon}`,
          }}>
            JARL!
          </div>
        )}
      </div>

      {/* Subtitles Karaoke */}
      {currentSub && (
        <div style={{
          position: 'absolute', top: '70%', left: '50%', transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%', zIndex: 10
        }}>
          <div style={{ color: C.yinmn, fontSize: 40, fontFamily: 'monospace', marginBottom: 20, fontWeight: 'bold' }}>
            {currentSub.who}
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              color: 'transparent', WebkitTextStroke: `3px rgba(255, 255, 255, 0.3)`,
              fontSize: 100, fontFamily: 'sans-serif', fontWeight: 900,
              textAlign: 'center', textTransform: 'uppercase', whiteSpace: 'pre-line'
            }}>
              {currentSub.text}
            </div>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              color: '#FFF', fontSize: 100, fontFamily: 'sans-serif', fontWeight: 900,
              textAlign: 'center', textTransform: 'uppercase', whiteSpace: 'pre-line',
              textShadow: `0 0 30px #000, 4px 4px 0 ${currentSub.who === 'CHIQUITOCRES' ? C.chiquito : C.jamon}`,
              clipPath: `polygon(0 0, ${Math.min(100, Math.max(0, ((sec - currentSub.s) / (currentSub.e - currentSub.s)) * 100))}% 0, ${Math.min(100, Math.max(0, ((sec - currentSub.s) / (currentSub.e - currentSub.s)) * 100))}% 100%, 0 100%)`,
            }}>
              {currentSub.text}
            </div>
          </div>
        </div>
      )}
      <Audio src={staticFile('acto4_paz_padilla.wav')} />
    </AbsoluteFill>
  );
};
