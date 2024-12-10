import { fetchPersonas, FlowProvider } from '@speechmatics/flow-client-react';
import { Controls } from './Controls';
import { PcmAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';
import workletScriptUrl from '@speechmatics/browser-audio-input/pcm-audio-worklet.min.js?url';
import { Status } from './Status';
import { OutputView } from './OutputView';

export async function loader() {
  return { personas: await fetchPersonas() };
}

export default function Flow() {
  return (
    <PcmAudioRecorderProvider workletScriptURL={workletScriptUrl}>
      <FlowProvider appId="remix-example">
        <section>
          <h3>Flow example</h3>
          <section className="grid">
            <Controls />
            <Status />
          </section>
          <OutputView />
        </section>
      </FlowProvider>
    </PcmAudioRecorderProvider>
  );
}
