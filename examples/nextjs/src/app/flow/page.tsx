import { fetchPersonas, FlowProvider } from '@speechmatics/flow-client-react';
import { PcmAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';
import { Controls } from './Controls';
import { Status } from './Status';
import { OutputView } from './OutputView';

export default async function Home() {
  const personas = await fetchPersonas();

  return (
    <PcmAudioRecorderProvider workletScriptURL="/js/pcm-audio-worklet.min.js">
      <FlowProvider appId="nextjs-example">
        <section>
          <h3>Flow Example</h3>
          <section className="grid">
            <Controls personas={personas} />
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
