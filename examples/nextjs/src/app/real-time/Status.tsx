'use client';
import { usePcmAudioRecorder } from '@speechmatics/browser-audio-input-react';
import { useRealtimeTranscription } from '@speechmatics/real-time-client-react';

export function Status() {
  const { socketState, sessionId } = useRealtimeTranscription();
  const { isRecording } = usePcmAudioRecorder();

  return (
    <article>
      <header>Status</header>
      <dl>
        <dt>🔌 Socket is</dt>
        <dd>{socketState ?? '(uninitialized)'}</dd>
        <dt>💬 Session ID</dt>
        <dd>{sessionId ?? '(none)'}</dd>
        <dt>🎤 Microphone is</dt>
        <dd>{isRecording ? 'recording' : 'not recording'}</dd>
      </dl>
    </article>
  );
}
