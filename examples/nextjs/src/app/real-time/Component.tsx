'use client';

import { useRealtimeTranscription } from '@speechmatics/real-time-client-react';
import { Controls } from './Controls';
import { useCallback } from 'react';

export default function Component() {
  const { sessionId, start } = useRealtimeTranscription();

  const startSession = useCallback(async (deviceId: string) => {});

  return (
    <section>
      <h3>Real-time Example</h3>
      <Controls />
    </section>
  );
}
