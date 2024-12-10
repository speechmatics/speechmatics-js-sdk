'use client';

import { useRealtimeTranscription } from '@speechmatics/real-time-client-react';
import { Controls } from './Controls';
import { useEffect } from 'react';
import {
  usePcmAudioListener,
  usePcmAudioRecorder,
} from '@speechmatics/browser-audio-input-react';
import { Output } from './Output';
import { Status } from './Status';

export default function Component() {
  const { stopTranscription, sendAudio } = useRealtimeTranscription();
  const { stopRecording } = usePcmAudioRecorder();

  usePcmAudioListener(sendAudio);

  // Cleanup
  useEffect(() => {
    return () => {
      stopTranscription();
      stopRecording();
    };
  }, [stopTranscription, stopRecording]);

  return (
    <section>
      <h3>Real-time Example</h3>
      <section className="grid">
        <Controls />
        <Status />
      </section>
      <section>
        <Output />
      </section>
    </section>
  );
}
