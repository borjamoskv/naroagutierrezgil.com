import { Composition } from 'remotion';
import { GonAgents } from './GonAgents';

// Audio duration: 917.37s = ~15.3 min
// At 30fps = 27,521 frames
const AUDIO_DURATION_SECONDS = 60;
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GonIntervaloProhibido"
        component={GonAgents}
        durationInFrames={AUDIO_DURATION_SECONDS * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
