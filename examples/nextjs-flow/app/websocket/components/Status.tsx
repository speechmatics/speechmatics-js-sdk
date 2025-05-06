'use client';
import { usePCMAudioRecorderContext } from '@speechmatics/browser-audio-input-react';
import { useFlow } from '@speechmatics/flow-client-react';
import Card from '../../../components/Card';

export function Status() {
  const { socketState, sessionId } = useFlow();
  const { isRecording } = usePCMAudioRecorderContext();

  return (
    <Card heading="Status">
      <StatusItem
        status="🔌 Socket is"
        result={socketState ?? '(uninitialized)'}
      />
      <StatusItem status="💬 Session ID" result={sessionId ?? '(none)'} />
      <StatusItem
        status="🎤 Microphone is"
        result={isRecording ? 'recording' : 'not recording'}
      />
    </Card>
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
