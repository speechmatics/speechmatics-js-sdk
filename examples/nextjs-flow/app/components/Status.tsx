'use client';
import { usePcmAudioRecorder } from '@speechmatics/browser-audio-input-react';
import { useFlow } from '@speechmatics/flow-client-react';

export function Status() {
  const { socketState, sessionId } = useFlow();
  const { isRecording } = usePcmAudioRecorder();

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">Status</h3>
        <div>
          <StatusItem
            status="🔌 Socket is"
            result={socketState ?? '(uninitialized)'}
          />
          <StatusItem status="💬 Session ID" result={sessionId ?? '(none)'} />
          <StatusItem
            status="🎤 Microphone is"
            result={isRecording ? 'recording' : 'not recording'}
          />
        </div>
      </div>
    </div>
  );
}

const StatusItem = ({ status, result }: { status: string; result: string }) => {
  return (
    <div className="flex">
      <p className="w-1/2">{status}: </p>
      <p className="w-1/2">{result}</p>
    </div>
  );
};
