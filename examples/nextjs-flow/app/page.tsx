import { fetchPersonas, FlowProvider } from '@speechmatics/flow-client-react';
import { PcmAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';
import { Controls } from './components/Controls';
import { Status } from './components/Status';
import { OutputView } from './components/OutputView';

export default async function Home() {
  const personas = await fetchPersonas();

  return (
    // Two context providers:
    // 1. For the audio recorder (see https://github.com/speechmatics/speechmatics-js-sdk/blob/main/packages/browser-audio-input-react/README.md)
    // 2. For the Flow API client (see https://github.com/speechmatics/speechmatics-js-sdk/blob/main/packages/flow-client-react/README.md)
    <PcmAudioRecorderProvider workletScriptURL="/js/pcm-audio-worklet.min.js">
      <FlowProvider appId="nextjs-example" audioBufferingMs={500}>
        <div className="container p-4 mx-auto max-xl:container">
          <h1 className="text-2xl font-bold">Flow Example</h1>
          <div className="grid grid-cols-2 gap-4 my-6">
            <Controls personas={personas} />
            <Status />
          </div>
          <OutputView />
        </div>
      </FlowProvider>
    </PcmAudioRecorderProvider>
  );
}
