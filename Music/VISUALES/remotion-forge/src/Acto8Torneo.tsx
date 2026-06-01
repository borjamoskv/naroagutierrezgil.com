import { AbsoluteFill, Audio, OffthreadVideo, useCurrentFrame, useVideoConfig, interpolate, spring, random, staticFile } from 'remotion';
import React from 'react';
import subtitles from './subtitles_acto8.json';

const noiseImg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

// Eddie Morci on a flying Morcilla
const EddieMorciSVG = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ transform: `translateY(${Math.sin(frame/10)*20}px)` }}>
    {/* Flying Morcilla */}
    <path d="M 20 120 Q 100 150 180 120 Q 190 100 180 80 Q 100 110 20 80 Q 10 100 20 120 Z" fill="#3B1C1C" stroke="#1A0C0C" strokeWidth="5" />
    <circle cx="40" cy="100" r="15" fill="#FFF" opacity="0.3" />
    <circle cx="160" cy="100" r="15" fill="#FFF" opacity="0.3" />
    
    {/* Eddie Morci */}
    <rect x="85" y="40" width="30" height="50" fill="#DAA520" /> {/* Gabardina dorada/tickets */}
    <circle cx="100" cy="30" r="15" fill="#F5DEB3" />
    <rect x="90" y="45" width="5" height="15" fill="#FFF" />
    <rect x="105" y="45" width="5" height="15" fill="#FFF" />
    <circle cx="95" cy="25" r="2" fill="#000" />
    <circle cx="105" cy="25" r="2" fill="#000" />
    {/* Golden Mic */}
    <rect x="110" y="55" width="20" height="5" fill="#FFD700" transform="rotate(-30 110 55)" />
    <circle cx="130" cy="45" r="8" fill="#555" />
  </svg>
);

const PabloPiccoloCommentators = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 200 100" width="100%" height="100%">
    {/* Table */}
    <rect x="20" y="60" width="160" height="40" fill="#8B4513" />
    <text x="30" y="85" fill="#FFF" fontFamily="Arial" fontSize="12" fontWeight="bold">TV BURGOS 4K</text>
    
    {/* Pablo Marmol */}
    <circle cx="60" cy="40" r="20" fill="#FFDAB9" />
    <rect x="40" y="50" width="40" height="10" fill="#8B4513" />
    
    {/* Piccolo */}
    <circle cx="140" cy="40" r="20" fill="#32CD32" />
    <path d="M 125 15 L 135 25 L 145 15 L 155 25 Z" fill="#FFF" /> {/* Turban */}
    <rect x="120" y="50" width="40" height="10" fill="#800080" /> {/* Purple Gi */}
    
    {/* Mics */}
    <rect x="70" y="40" width="5" height="20" fill="#555" />
    <circle cx="72.5" cy="35" r="8" fill="#222" />
    <rect x="125" y="40" width="5" height="20" fill="#555" />
    <circle cx="127.5" cy="35" r="8" fill="#222" />
  </svg>
);

// Paquirri Ethics Professor (Visual Gag)
const PaquirriProfesorSVG = ({ frame }: { frame: number }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: `scale(1.2)` }}>
    {/* Pizarra */}
    <rect x="10" y="10" width="80" height="50" fill="#2E8B57" stroke="#8B4513" strokeWidth="3" />
    <text x="15" y="30" fill="#FFF" fontFamily="Times New Roman" fontSize="8">KANT = CAPOTE</text>
    <text x="15" y="45" fill="#FFF" fontFamily="Times New Roman" fontSize="8">NIETZSCHE = CORNADA</text>
    {/* Book "Etica para Ramon" */}
    <rect x="15" y="75" width="20" height="15" fill="#8B0000" transform="rotate(-15 15 75)" />
    <rect x="16" y="76" width="18" height="13" fill="#FFF" transform="rotate(-15 15 75)" />
    <text x="18" y="82" fill="#000" fontFamily="Times New Roman" fontSize="3" transform="rotate(-15 15 75)" fontWeight="bold">ÉTICA</text>
    <text x="18" y="86" fill="#000" fontFamily="Times New Roman" fontSize="3" transform="rotate(-15 15 75)" fontWeight="bold">PARA</text>
    <text x="18" y="90" fill="#000" fontFamily="Times New Roman" fontSize="3" transform="rotate(-15 15 75)" fontWeight="bold">RAMÓN</text>
    {/* Paquirri */}
    <circle cx="50" cy="70" r="15" fill="#FFDAB9" />
    <rect x="40" y="85" width="20" height="15" fill="#FFD700" /> {/* Traje de luces dorado */}
    <path d="M 35 60 Q 50 50 65 60" fill="#0A0A0A" /> {/* Pelo torero */}
    {/* Montera/Gafas */}
    <rect x="42" y="65" width="6" height="4" fill="none" stroke="#000" />
    <rect x="52" y="65" width="6" height="4" fill="none" stroke="#000" />
    <path d="M 48 67 L 52 67" stroke="#000" />
  </svg>
);

export const Acto8Torneo: React.FC = () => {
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
  
  const isEddie = activeSubtitle?.avatar === 'eddie_morci';
  const isCommentators = activeSubtitle?.avatar === 'pablo' || activeSubtitle?.avatar === 'piccolo';
  const isPantoja = activeSubtitle?.avatar === 'pantoja';
  
  return (
    <AbsoluteFill style={{ 
        backgroundColor: '#0A0A0A', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        overflow: 'hidden'
    }}>
      <Audio src={staticFile('acto8_torneo.wav')} />
      
      {/* 4K Cinematic Noise Overlay */}
      <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url("${noiseImg}")`,
          opacity: 0.15,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          zIndex: 9999
      }} />

      {/* The Impossible Stadium Background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, #111 0, #111 20px, #2B3BE5 21px, #2B3BE5 22px)',
        transform: `rotate(${frame/2}deg) scale(${1 + Math.sin(frame/50)*0.2})`,
        opacity: 0.3,
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 40px, #FF0000 41px, #FF0000 42px)',
        transform: `rotate(${-frame}deg) scale(${1 + Math.cos(frame/30)*0.1})`,
        opacity: 0.2,
        zIndex: 0
      }} />

      {/* Main Action Area */}
      <div style={{ zIndex: 10, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {isCommentators && (
          <div style={{ width: 800, height: 400, transform: `scale(${1 + (random(`c-${frame}`)-0.5)*0.02})` }}>
            <PabloPiccoloCommentators frame={frame} />
          </div>
        )}

        {isEddie && (
          <div style={{ width: 600, height: 600 }}>
            <EddieMorciSVG frame={frame} />
          </div>
        )}

        {/* Visual Gags: Paquirri & Gica Hagi (Shows up during "traumas" or random cuñados) */}
        {!isCommentators && !isEddie && !isPantoja && (
           <>
             <div style={{ width: 400, height: 400, position: 'absolute', right: '10%', bottom: '20%' }}>
               <PaquirriProfesorSVG frame={frame} />
             </div>
             
             {/* Gica Hagi Gag */}
             <div style={{ width: 350, height: 350, position: 'absolute', left: '10%', bottom: '20%', transform: `scale(${1 + Math.sin(frame/15)*0.05})` }}>
               <svg viewBox="0 0 100 100" width="100%" height="100%">
                 {/* Body / Camiseta */}
                 <rect x="25" y="50" width="50" height="50" fill="#FFFF00" /> {/* Yellow Romanian/Galatasaray style shirt */}
                 <text x="30" y="65" fill="#000" fontFamily="Arial" fontSize="5" fontWeight="bold">EL SER</text>
                 <text x="30" y="72" fill="#000" fontFamily="Arial" fontSize="5" fontWeight="bold">RUMANO</text>
                 <text x="30" y="79" fill="#000" fontFamily="Arial" fontSize="5" fontWeight="bold">ES</text>
                 <text x="30" y="86" fill="#000" fontFamily="Arial" fontSize="5" fontWeight="bold">MARAVILLOSO</text>
                 {/* Head */}
                 <circle cx="50" cy="30" r="18" fill="#FFDAB9" />
                 {/* Hair (Hagi 90s mullet/curly) */}
                 <path d="M 30 30 Q 50 0 70 30 Q 75 40 65 45 Q 50 35 35 45 Q 25 40 30 30 Z" fill="#4B0082" />
                 {/* Face */}
                 <circle cx="43" cy="28" r="2" fill="#000" />
                 <circle cx="57" cy="28" r="2" fill="#000" />
                 <path d="M 45 38 Q 50 42 55 38" stroke="#000" strokeWidth="1" fill="none" />
                 {/* Football */}
                 <circle cx="80" cy="90" r="10" fill="#FFF" stroke="#000" strokeWidth="1" />
                 <path d="M 75 85 L 85 95 M 75 95 L 85 85" stroke="#000" strokeWidth="1" />
               </svg>
             </div>
           </>
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
          color: '#FFF',
          fontSize: '50px',
          fontFamily: 'Impact, sans-serif',
          textAlign: 'center',
          maxWidth: '80%',
          zIndex: 20,
          boxShadow: '0 0 30px #2B3BE5',
          transform: `translateY(${subtitleY}px) scale(${subtitleScale})`,
          opacity: subtitleOpacity,
        }}>
          {activeSubtitle.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
