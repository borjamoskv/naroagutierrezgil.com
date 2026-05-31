import { AbsoluteFill, useVideoConfig, useCurrentFrame } from 'remotion';

export const MoskvComposition = () => {
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  
  const opacity = Math.min(1, frame / 30);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: '#2B3BE5', fontSize: '60px', opacity, fontFamily: 'monospace', fontWeight: 'bold' }}>
        MOSKV VISUALES
      </div>
      <div style={{ color: '#FFB800', fontSize: '30px', opacity, fontFamily: 'monospace', marginTop: '20px' }}>
        C5-REAL RENDERING PROTOCOL
      </div>
      <div style={{ position: 'absolute', bottom: '40px', left: '40px', color: '#1A1A2E', fontSize: '150px', fontWeight: '900', zIndex: -1 }}>
        01
      </div>
    </AbsoluteFill>
  );
};
