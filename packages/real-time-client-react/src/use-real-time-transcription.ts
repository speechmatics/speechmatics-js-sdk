import { useCallback, useContext, useMemo } from 'react';
import { RealtimeContext } from './real-time-context';
import type {
  RealtimeClient,
  RealtimeClientEventMap,
} from '@speechmatics/real-time-client';
import type { TypedEventTarget } from 'typescript-event-target';

type MethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never;
}[keyof T];

/** Public methods of `RealtimeClient`, excluding those inherited from the event target */
type ClientMethod = Exclude<
  MethodKeys<RealtimeClient>,
  MethodKeys<TypedEventTarget<RealtimeClientEventMap>>
>;

/** Client methods which the hook exposes under a different name */
type RenamedClientMethod = 'start' | 'stopRecognition';

/**
 * Ensures the hook exposes every public client method, so newly added methods aren't missed.
 * The index signature allows extra properties that aren't client methods (e.g. `sessionId`).
 */
type ExposesAllClientMethods = Record<
  Exclude<ClientMethod, RenamedClientMethod>,
  unknown
> &
  Record<string, unknown>;

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

  const sendChannelAudio = useCallback<RealtimeClient['sendChannelAudio']>(
    (channel, audio) => {
      client.sendChannelAudio(channel, audio);
    },
    [client],
  );

  const endChannel = useCallback<RealtimeClient['endChannel']>(
    (channel) => {
      client.endChannel(channel);
    },
    [client],
  );

  const forceEndOfUtterance = useCallback<
    RealtimeClient['forceEndOfUtterance']
  >(
    (channel) => {
      client.forceEndOfUtterance(channel);
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
    () =>
      ({
        sessionId,
        socketState,
        startTranscription,
        stopTranscription,
        sendAudio,
        sendChannelAudio,
        endChannel,
        forceEndOfUtterance,
        setRecognitionConfig,
        getSpeakers,
      }) satisfies ExposesAllClientMethods,
    [
      sessionId,
      socketState,
      startTranscription,
      stopTranscription,
      sendAudio,
      sendChannelAudio,
      endChannel,
      forceEndOfUtterance,
      setRecognitionConfig,
      getSpeakers,
    ],
  );
}
