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
import { Acto4_5Maletin } from './Acto4_5Maletin';
import { Acto8Torneo } from './Acto8Torneo';
import { Acto9Recreativas } from './Acto9Recreativas';
import { Acto10Flashback } from './Acto10Flashback';
import { Epilogo } from './Epilogo';
import { Acto11Podcast } from './Acto11Podcast';
import { Acto12Marmol } from './Acto12Marmol';

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
      <Composition
        id="Acto4-5Maletin"
        component={Acto4_5Maletin}
        durationInFrames={Math.ceil(100.0 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Acto8Torneo"
        component={Acto8Torneo}
        durationInFrames={Math.ceil(120.0 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Acto9Recreativas"
        component={Acto9Recreativas}
        durationInFrames={Math.ceil(110.0 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Acto10Flashback"
        component={Acto10Flashback}
        durationInFrames={Math.ceil(90.0 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Epilogo"
        component={Epilogo}
        durationInFrames={Math.ceil(35.0 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Acto11Podcast"
        component={Acto11Podcast}
        durationInFrames={Math.ceil(46.0 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Acto12Marmol"
        component={Acto12Marmol}
        durationInFrames={Math.ceil(9.0 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
