'use client';
import { usePCMAudioRecorderContext } from '@speechmatics/browser-audio-input-react';
import { useFlow } from '@speechmatics/flow-client-react';
import { usePCMAudioPlayerContext } from '@speechmatics/web-pcm-player-react';

export function Status() {
  const { socketState, sessionId } = useFlow();
  const { isRecording } = usePCMAudioRecorderContext();

  const { analyser } = usePCMAudioPlayerContext();
  console.log('Analyser', analyser);

  return (
    <div className="card card-border shadow-md">
      <div className="card-body">
        <div className="card-title">
          <h3>Status</h3>
        </div>
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
