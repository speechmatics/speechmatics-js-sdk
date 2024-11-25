import { RealtimeTranscriptionProvider } from '@speechmatics/real-time-client-react';
import Component from './Component';
import { PcmAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';

export default function Page() {
  return (
    <PcmAudioRecorderProvider workletScriptURL="/js/pcm-audio-worklet.min.js">
      <RealtimeTranscriptionProvider appId="nextjs-rt-example">
        <Component />
      </RealtimeTranscriptionProvider>
    </PcmAudioRecorderProvider>
  );
}
