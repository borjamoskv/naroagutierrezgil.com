import { Composition } from 'remotion';
import { GonAgents } from './GonAgents';
import { GonAgentsActo2 } from './GonAgentsActo2';
import { GonAgentsActo3 } from './GonAgentsActo3';
import { GonPantojaRap } from './GonPantojaRap';
import { LaundryOrgy } from './LaundryOrgy';
import { Acto4PazChiquito } from './Acto4PazChiquito';
import { Acto5FitoConcert } from './Acto5FitoConcert';
import { Acto6Rayohead } from './Acto6Rayohead';
import { Acto7Pirri } from './Acto7Pirri';

const AUDIO_DURATION_SECONDS = 60;
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GonIntervaloProhibido"
        component={GonAgents}
        durationInFrames={Math.ceil(214.68 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="GonIntervaloProhibidoActo2"
        component={GonAgentsActo2}
        durationInFrames={Math.ceil(68.60 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="GonIntervaloProhibidoActo3"
        component={GonAgentsActo3}
        durationInFrames={Math.ceil(78.10 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="GonPantojaRap"
        component={GonPantojaRap}
        durationInFrames={Math.ceil(331.56 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="LaundryOrgy"
        component={LaundryOrgy}
        durationInFrames={Math.ceil(60 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Acto4PazChiquito"
        component={Acto4PazChiquito}
        durationInFrames={Math.ceil(97.43 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Acto5FitoConcert"
        component={Acto5FitoConcert}
        durationInFrames={Math.ceil(55.52 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Acto6Rayohead"
        component={Acto6Rayohead}
        durationInFrames={Math.ceil(39.75 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Acto7Pirri"
        component={Acto7Pirri}
        durationInFrames={Math.ceil(70.0 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
