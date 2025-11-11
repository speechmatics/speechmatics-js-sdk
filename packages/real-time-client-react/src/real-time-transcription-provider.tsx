'use client';

import { RealtimeClient } from '@speechmatics/real-time-client';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { RealtimeContext } from './real-time-context';
import { useClientEventListener } from './use-real-time-event-listener';

type Options = ConstructorParameters<typeof RealtimeClient>[0];

export function RealtimeTranscriptionProvider({
  children,
  ...options
}: React.PropsWithChildren<Options>) {
  const client = useMemo(() => {
    return new RealtimeClient({
      url: options.url,
      appId: options.appId,
      enableLegacy: options.enableLegacy,
      connectionTimeout: options.connectionTimeout,
    });
  }, [
    options.url,
    options.appId,
    options.enableLegacy,
    options.connectionTimeout,
  ]);

  // Clean up on unmount (or if the client somehow changes)
  useEffect(() => {
    return () => {
      if (client.socketState && client.socketState !== 'closed') {
        client.stopRecognition();
      }
    };
  }, [client]);

  const socketState = useClientSocketState(client);
  const [sessionId, setSessionId] = useState<string>();

  useClientEventListener(client, 'receiveMessage', ({ data }) => {
    if (data.message === 'Error') {
      console.error(data);
    } else if (data.message === 'RecognitionStarted') {
      setSessionId(data.id);
    }
  });

  useClientEventListener(client, 'socketStateChange', (e) => {
    if (client.socketState === 'closed') {
      setSessionId(undefined);
    }
  });

  const value = useMemo(
    () => ({
      client,
      socketState,
      sessionId,
    }),
    [client, socketState, sessionId],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

function useClientSocketState(client: RealtimeClient) {
  const subscribe = (onChange: () => void) => {
    client.addEventListener('socketStateChange', onChange);
    return () => {
      client.removeEventListener('socketStateChange', onChange);
    };
  };

  const getSnapshot = () => client.socketState;
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
