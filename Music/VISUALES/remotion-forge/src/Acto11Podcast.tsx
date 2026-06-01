import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  staticFile,
} from 'remotion';

import subtitles from './subtitles_acto11.json';

const THEME = {
  bg: '#0A0A0A',
  primary: '#2B3BE5',
  text: '#E0E0E0',
  accent: '#FF0055',
  neon: '#00FFAA'
};

export const Acto11Podcast: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find the active subtitle
  const activeSub = subtitles.find(
    (s) => currentTime >= s.start && currentTime <= s.end
  );

  // Background glitching
  const glitch = Math.sin(frame * 0.5) * 5;
  const opacity = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.8, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg, color: THEME.text, fontFamily: 'monospace', overflow: 'hidden' }}>
      <Audio src={staticFile('acto11_audio.wav')} />
      
      {/* Grid Background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `linear-gradient(${THEME.primary}33 1px, transparent 1px), linear-gradient(90deg, ${THEME.primary}33 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        opacity: 0.3,
        transform: `translateY(${(frame % 50)}px)`
      }} />

      {/* Podcast Table / Carajillo Cuántico */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: '20%',
        right: '20%',
        height: 200,
        backgroundColor: '#111',
        borderTop: `4px solid ${THEME.primary}`,
        borderRadius: '50% 50% 0 0 / 20px 20px 0 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: 50,
        boxShadow: `0 -20px 50px ${THEME.primary}44`
      }}>
        {/* The Carajillo */}
        <div style={{
          width: 60,
          height: 80,
          backgroundColor: '#3e2723',
          border: `2px solid ${THEME.accent}`,
          borderRadius: '5px 5px 20px 20px',
          boxShadow: `0 0 ${20 + Math.sin(frame*0.2)*10}px ${THEME.accent}`,
          position: 'relative'
        }}>
           <div style={{
             position: 'absolute',
             top: -20, left: 10, right: 10, height: 20,
             background: `linear-gradient(to top, ${THEME.accent}, transparent)`,
             opacity: Math.random() * 0.5 + 0.5
           }} />
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        fontSize: 32,
        fontWeight: 'bold',
        color: THEME.primary,
        textTransform: 'uppercase',
        letterSpacing: 4
      }}>
        [ PODCAST CAÑÍ-EXPANDIDO ]<br/>
        <span style={{ fontSize: 16, color: '#666' }}>REALITY LEVEL: C5-REAL / LATE NIGHT</span>
      </div>

      {/* Speaker Display */}
      {activeSub && (
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '15%',
          right: '15%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          transform: `translateX(${glitch}px)`
        }}>
          <div style={{
            fontSize: 24,
            color: THEME.neon,
            marginBottom: 20,
            textTransform: 'uppercase',
            letterSpacing: 2,
            border: `1px solid ${THEME.neon}`,
            padding: '5px 15px',
            background: `${THEME.neon}22`
          }}>
            {activeSub.speaker}
          </div>
          <div style={{
            fontSize: 48,
            fontWeight: 'bold',
            lineHeight: 1.2,
            textShadow: `2px 2px 0 ${THEME.primary}, -2px -2px 0 ${THEME.accent}`,
            opacity
          }}>
            "{activeSub.text}"
          </div>
        </div>
      )}

      {/* Overlay CRT scanlines */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
        backgroundSize: '100% 4px, 6px 100%',
        pointerEvents: 'none'
      }} />
    </AbsoluteFill>
  );
};
