import { useFlow } from '@speechmatics/flow-client-react';

export function Status({ isRecording }: { isRecording: boolean }) {
  const { socketState, sessionId } = useFlow();

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
