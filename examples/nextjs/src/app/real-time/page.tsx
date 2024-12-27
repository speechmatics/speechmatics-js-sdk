import { RealtimeTranscriptionProvider } from '@speechmatics/real-time-client-react';
import { PcmAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';
import { Controls } from './Controls';
import { Status } from './Status';
import { Output } from './Output';

export default async function Page() {
  const resp = await fetch(
    'https://asr.api.speechmatics.com/v1/discovery/features',
  );

  const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });

  // TODO figure out if there's an RT specific discovery endpoint
  const languages = (await resp.json()).batch.transcription[0].languages.map(
    (code: string) => [code, displayNames.of(code)] as const,
  );

  return (
    <PcmAudioRecorderProvider workletScriptURL="/js/pcm-audio-worklet.min.js">
      <RealtimeTranscriptionProvider appId="nextjs-rt-example">
        <section>
          <h3>Real-time Example</h3>
          <section className="grid">
            <Controls languages={languages} />
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
