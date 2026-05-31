import { Composition } from 'remotion';
import { GonAgents } from './GonAgents';
import { GonAgentsActo2 } from './GonAgentsActo2';
import { GonAgentsActo3 } from './GonAgentsActo3';

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
      <Composition
        id="GonIntervaloProhibidoActo2"
        component={GonAgentsActo2}
        durationInFrames={AUDIO_DURATION_SECONDS * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="GonIntervaloProhibidoActo3"
        component={GonAgentsActo3}
        durationInFrames={AUDIO_DURATION_SECONDS * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
