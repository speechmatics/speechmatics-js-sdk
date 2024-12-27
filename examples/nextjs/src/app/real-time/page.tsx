import { RealtimeTranscriptionProvider } from '@speechmatics/real-time-client-react';
import { PcmAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';
import { Controls } from './Controls';
import { Status } from './Status';
import { Output } from './Output';
import { MicrophoneSelect } from '@/lib/components/MicrophoneSelect';
import { LanguageSelect } from './LanguageSelect';

export default function Page() {
  return (
    <PcmAudioRecorderProvider workletScriptURL="/js/pcm-audio-worklet.min.js">
      <RealtimeTranscriptionProvider appId="nextjs-rt-example">
        <section>
          <h3>Real-time Example</h3>
          <section className="grid">
            <Controls>
              <MicrophoneSelect />
              <LanguageSelect />
            </Controls>
            <Status />
          </section>
          <section>
            <Output />
          </section>
        </section>
      </RealtimeTranscriptionProvider>
    </PcmAudioRecorderProvider>
  );
}
