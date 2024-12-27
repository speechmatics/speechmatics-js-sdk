import { FlowProvider } from '@speechmatics/flow-client-react';
import { PcmAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';
import { Controls } from './Controls';
import { Status } from './Status';
import { OutputView } from './OutputView';
import { PersonaSelect } from './PersonaSelect';
import { MicrophoneSelect } from '@/lib/components/MicrophoneSelect';

export default function Home() {
  return (
    <PcmAudioRecorderProvider workletScriptURL="/js/pcm-audio-worklet.min.js">
      <FlowProvider appId="nextjs-example">
        <section>
          <h3>Flow Example</h3>
          <section className="grid">
            <Controls>
              <MicrophoneSelect />
              <PersonaSelect />
            </Controls>
            <Status />
          </section>
          <section>
            <OutputView />
          </section>
        </section>
      </FlowProvider>
    </PcmAudioRecorderProvider>
  );
}
