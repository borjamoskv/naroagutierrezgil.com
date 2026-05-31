import React from 'react';
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import subs from './subtitles_acto6.json';

const C = {
  bg: '#1A1A1A',
  rayoRed: '#ED1C24',
  yorkjeSkin: '#E8D5C4',
  textBase: '#CCCCCC'
};

export const Acto6Rayohead: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const currentSub = (subs as any[]).find(s => sec >= s.s && sec < s.e);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      
      {/* Depressing Vallekas Fog Background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(circle at 50% 60%, #333333 0%, ${C.bg} 100%)`,
        opacity: 0.8 + Math.sin(frame*0.05)*0.2,
        zIndex: 0
      }} />

      {/* Rayohead Crest */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        zIndex: 1, opacity: 0.3
      }}>
        <svg width="400" height="400" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke={C.rayoRed} strokeWidth="10" />
          <path d="M 50 50 L 120 100 L 80 120 L 150 180" fill="none" stroke={C.rayoRed} strokeWidth="15" strokeLinejoin="round" />
          <text x="100" y="40" fontSize="24" fill={C.rayoRed} textAnchor="middle" fontFamily="sans-serif" fontWeight="900" letterSpacing="2">RAYOHEAD</text>
        </svg>
      </div>

      {/* Tomas Yorkje */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame*0.02)*0.02}) rotate(${Math.sin(frame*0.1)*1}deg)`,
        zIndex: 2
      }}>
        <svg width="300" height="400" viewBox="0 0 100 150">
          {/* Microphone Stand */}
          <line x1="20" y1="150" x2="20" y2="50" stroke="#555" strokeWidth="4" />
          <circle cx="20" cy="45" r="8" fill="#333" />
          
          {/* Body */}
          <rect x="40" y="60" width="30" height="60" fill="#222" rx="5" />
          {/* Head (Drooping) */}
          <g transform={`rotate(${15 + Math.sin(frame*0.05)*5} 55 50)`}>
            <circle cx="55" cy="40" r="18" fill={C.yorkjeSkin} />
            {/* Lazy Eye */}
            <circle cx="48" cy="38" r="4" fill="#FFF" />
            <circle cx="48" cy="38" r="1.5" fill="#000" />
            <circle cx="62" cy="36" r="4" fill="#FFF" />
            <circle cx="62" cy="37" r="1.5" fill="#000" />
            {/* Messy Hair */}
            <path d="M 35 40 Q 50 15 75 35 Q 80 20 60 10 Q 40 10 35 40 Z" fill="#4A3B32" />
            {/* Depressed Mouth */}
            <path d="M 48 50 Q 55 45 62 50" stroke="#000" strokeWidth="1.5" fill="none" />
          </g>
          {/* Arm holding mic */}
          <path d="M 45 70 Q 30 60 25 50" stroke={C.yorkjeSkin} strokeWidth="6" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      {/* Gon Crying Uncontrollably */}
      <div style={{
        position: 'absolute', right: `${15 + Math.sin(frame * 0.1) * 3}%`, bottom: '20%',
        transform: `translate(50%, 50%) scale(${1.2 + Math.sin(frame * 0.5) * 0.1})`,
        zIndex: 3,
        opacity: frame > 200 ? 1 : 0, // Appears later in the scene
        transition: 'opacity 0.5s'
      }}>
        <svg width="250" height="250" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 10px #00F)' }}>
          {/* Super Saiyan Hair (Sad & Drooping) */}
          <polygon points="30,40 15,20 40,30 50,15 60,30 85,20 70,40" fill="#B8860B" />
          
          {/* Head */}
          <circle cx="50" cy="50" r="20" fill="#FAD6B1" />
          
          {/* Closed Crying Eyes */}
          <path d="M 40 45 Q 45 42 50 45" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M 50 45 Q 55 42 60 45" stroke="#000" strokeWidth="2" fill="none" />
          
          {/* Crying Tears (Waterfall) */}
          <path d="M 42 45 L 42 80 L 48 80 Z" fill="#00FFFF" opacity={0.7 + Math.sin(frame*0.5)*0.3} />
          <path d="M 58 45 L 58 80 L 52 80 Z" fill="#00FFFF" opacity={0.7 + Math.sin(frame*0.5)*0.3} />
          
          {/* Crying Mouth (Wide Open) */}
          <ellipse cx="50" cy="58" rx="8" ry="10" fill="#000" />
          <path d="M 42 58 Q 50 70 58 58" fill="#F00" /> {/* Tongue */}
        </svg>
      </div>

      {/* La Pantoja Returns (from the bathroom) */}
      <div style={{
        position: 'absolute', left: `${-10 + Math.min(30, (frame - 300)*0.5)}%`, bottom: '15%',
        transform: `translate(-50%, 50%) scale(${1.3 + Math.sin(frame*0.1)*0.05})`,
        zIndex: 4,
        opacity: frame > 300 ? 1 : 0, // Appears very late in the scene
        transition: 'opacity 0.2s'
      }}>
        <svg width="250" height="400" viewBox="0 0 100 150" style={{ filter: 'drop-shadow(0 0 15px #FFD700)' }}>
          {/* Peineta (Comb) */}
          <path d="M 30 20 Q 50 -10 70 20" fill="none" stroke="#FFD700" strokeWidth="8" />
          {/* Hair (Moño) */}
          <circle cx="50" cy="25" r="20" fill="#000" />
          {/* Head */}
          <circle cx="50" cy="45" r="15" fill="#FFE4C4" />
          {/* Eyes (Fierce) */}
          <path d="M 40 40 L 45 43" stroke="#000" strokeWidth="2" />
          <path d="M 60 40 L 55 43" stroke="#000" strokeWidth="2" />
          <circle cx="43" cy="43" r="2" fill="#000" />
          <circle cx="57" cy="43" r="2" fill="#000" />
          {/* Lipstick Smile */}
          <path d="M 45 52 Q 50 58 55 52" stroke="#F00" strokeWidth="3" fill="none" />
          {/* Flamenco Dress */}
          <path d="M 35 60 L 65 60 L 80 130 Q 50 150 20 130 Z" fill="#F00" />
          {/* Polka Dots */}
          <circle cx="45" cy="80" r="3" fill="#FFF" />
          <circle cx="65" cy="90" r="3" fill="#FFF" />
          <circle cx="35" cy="100" r="3" fill="#FFF" />
          <circle cx="55" cy="115" r="3" fill="#FFF" />
          <circle cx="70" cy="120" r="3" fill="#FFF" />
          
          {/* Toilet Paper stuck to shoe */}
          <path d="M 20 130 Q 10 140 0 140 Q -10 145 -5 150 Q 5 150 10 145 Z" fill="#FFF" opacity="0.9" />
          <text x="25" y="145" fontSize="8" fill="#FFF">TP</text>
        </svg>
      </div>

      {/* Subtitles Karaoke */}
      {currentSub && (
        <div style={{
          position: 'absolute', top: '75%', left: '50%', transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%', zIndex: 20
        }}>
          <div style={{ color: C.rayoRed, fontSize: 40, fontFamily: 'monospace', marginBottom: 20, fontWeight: 'bold', backgroundColor: '#000A', padding: '5px 20px', borderRadius: 10 }}>
            {currentSub.who}
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              color: 'transparent', WebkitTextStroke: `3px rgba(255, 255, 255, 0.4)`,
              fontSize: 80, fontFamily: 'sans-serif', fontWeight: 900,
              textAlign: 'center', textTransform: 'uppercase', whiteSpace: 'pre-line'
            }}>
              {currentSub.text}
            </div>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              color: '#FFF', fontSize: 80, fontFamily: 'sans-serif', fontWeight: 900,
              textAlign: 'center', textTransform: 'uppercase', whiteSpace: 'pre-line',
              textShadow: `0 0 30px #000, 4px 4px 0 ${C.rayoRed}`,
              clipPath: `polygon(0 0, ${Math.min(100, Math.max(0, ((sec - currentSub.s) / (currentSub.e - currentSub.s)) * 100))}% 0, ${Math.min(100, Math.max(0, ((sec - currentSub.s) / (currentSub.e - currentSub.s)) * 100))}% 100%, 0 100%)`,
            }}>
              {currentSub.text}
            </div>
          </div>
        </div>
      )}
      <Audio src={staticFile('acto6_rayohead.wav')} />
    </AbsoluteFill>
  );
};
