import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  Img,
  interpolate,
  staticFile,
} from 'remotion';

import subtitles from './subtitles_acto12.json';

const THEME = {
  bg: '#0A0A0A',
  primary: '#FFAA00', // BBQ fire color
  text: '#FFFFFF',
};

export const Acto12Marmol: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const activeSub = subtitles.find(
    (s) => currentTime >= s.start && currentTime <= s.end
  );

  // Flicker for BBQ fire
  const fireIntensity = Math.random() * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg, color: THEME.text, fontFamily: 'monospace' }}>
      <Audio src={staticFile('acto12_audio.wav')} />
      
      {/* Background void */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(circle at center 80%, ${THEME.primary}22 0%, transparent 60%)`,
        opacity: fireIntensity
      }} />

      {/* BBQ / Mármol Representation */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Pablo Mármol (Abstract/Pixel) */}
        <div style={{
          width: 80, height: 120,
          backgroundColor: '#D2B48C', // Tan color
          borderRadius: 10,
          marginBottom: 20,
          position: 'relative'
        }}>
          {/* Eyes */}
          <div style={{ position: 'absolute', top: 20, left: 15, width: 10, height: 10, backgroundColor: '#000', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: 20, right: 15, width: 10, height: 10, backgroundColor: '#000', borderRadius: '50%' }} />
        </div>

        {/* BBQ */}
        <div style={{
          width: 200, height: 150,
          backgroundColor: '#222',
          borderRadius: '50% 50% 10px 10px',
          borderTop: `10px solid ${THEME.primary}`,
          boxShadow: `0 -10px 50px ${THEME.primary}`,
          position: 'relative'
        }}>
           <div style={{
             position: 'absolute',
             top: -20, left: 20, right: 20, height: 30,
             background: `linear-gradient(to top, ${THEME.primary}, transparent)`,
             opacity: fireIntensity
           }} />
        </div>
      </div>

      {/* Subtitle */}
      {activeSub && (
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          right: '10%',
          textAlign: 'center',
          fontSize: 64,
          fontWeight: 'bold',
          lineHeight: 1.2,
          textShadow: `2px 2px 0 #000, -2px -2px 0 #000`
        }}>
          "{activeSub.text}"
        </div>
      )}

      {/* The Abrupt Cut */}
      {/* Handled by duration of the composition ending exactly where the audio cuts */}
    </AbsoluteFill>
  );
};
