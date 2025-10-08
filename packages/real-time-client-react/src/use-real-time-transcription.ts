import { useCallback, useContext, useMemo } from 'react';
import { RealtimeContext } from './real-time-context';
import type { RealtimeClient } from '@speechmatics/real-time-client';

export function useRealtimeTranscription() {
  const context = useContext(RealtimeContext);

  if (context === null) {
    throw new Error('Flow client uninitialized in context');
  }

  const { client, sessionId, socketState } = context;

  const startTranscription = useCallback<RealtimeClient['start']>(
    (jwt, config) => {
      return client.start(jwt, config);
    },
    [client],
  );

  const stopTranscription = useCallback<
    RealtimeClient['stopRecognition']
  >(() => {
    return client.stopRecognition();
  }, [client]);

  const sendAudio = useCallback<RealtimeClient['sendAudio']>(
    (audio: ArrayBuffer) => {
      client.sendAudio(audio);
    },
    [client],
  );

  const getSpeakers = useCallback<RealtimeClient['getSpeakers']>(
    (final?: boolean) => {
      return client.getSpeakers(final);
    },
    [client],
  );

  return useMemo(
    () => ({
      sessionId,
      socketState,
      startTranscription,
      stopTranscription,
      sendAudio,
      getSpeakers,
    }),
    [sessionId, socketState, startTranscription, stopTranscription, sendAudio, getSpeakers],
  );
}
