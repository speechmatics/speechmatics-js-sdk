import { fetchPersonas, FlowProvider } from '@speechmatics/flow-client-react';
import Component from './Component';
import { PcmAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';

export default async function Home() {
  const personas = await fetchPersonas();

  return (
    <PcmAudioRecorderProvider workletScriptURL="/js/pcm-audio-worklet.min.js">
      <FlowProvider appId="nextjs-example">
        <Component personas={personas} />
      </FlowProvider>
    </PcmAudioRecorderProvider>
  );
}
