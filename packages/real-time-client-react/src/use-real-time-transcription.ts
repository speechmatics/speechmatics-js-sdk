import { useCallback, useContext, useMemo } from 'react';
import { RealtimeContext } from './real-time-context';
import type { RealtimeClient } from '@speechmatics/real-time-client';

export function useRealtimeTranscription() {
  const context = useContext(RealtimeContext);

  if (context === null) {
    throw new Error('Flow client uninitialized in context');
  }

  const { client, sessionId, socketState } = context;

  const start = useCallback<RealtimeClient['start']>(
    (jwt, config) => {
      return client.start(jwt, config);
    },
    [client],
  );

  const stop = useCallback<RealtimeClient['stopRecognition']>(() => {
    return client.stopRecognition();
  }, [client]);

  return useMemo(
    () => ({
      sessionId,
      socketState,
      start,
      stop,
    }),
    [sessionId, socketState, start, stop],
  );
}
