'use client';

import { useRealtimeTranscription } from '@speechmatics/real-time-client-react';
import { Controls } from './Controls';
import { useEffect } from 'react';
import {
  usePcmAudioListener,
  usePcmAudioRecorder,
} from '@speechmatics/browser-audio-input-react';
import { Output } from './Output';

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
      <Controls />
      <Output />
    </section>
  );
}
