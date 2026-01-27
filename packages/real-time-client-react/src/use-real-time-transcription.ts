import { useCallback, useContext, useMemo } from 'react';
import { RealtimeContext } from './real-time-context';
import type { RealtimeClient } from '@speechmatics/real-time-client';

export function useRealtimeTranscription() {
  const context = useContext(RealtimeContext);

  if (context === null) {
    throw new Error('Realtime client uninitialized in context');
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

  const setRecognitionConfig = useCallback<
    RealtimeClient['setRecognitionConfig']
  >(
    (config) => {
      client.setRecognitionConfig(config);
    },
    [client],
  );

  const getSpeakers = useCallback<RealtimeClient['getSpeakers']>(
    (options?: { final?: boolean; timeout?: number }) => {
      return client.getSpeakers(options);
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
      setRecognitionConfig,
      getSpeakers,
    }),
    [
      sessionId,
      socketState,
      startTranscription,
      stopTranscription,
      sendAudio,
      setRecognitionConfig,
      getSpeakers,
    ],
  );
}
