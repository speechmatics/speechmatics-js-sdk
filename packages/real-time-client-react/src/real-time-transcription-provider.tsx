'use client';

import { RealtimeClient } from '@speechmatics/real-time-client';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { RealtimeContext } from './real-time-context';
import { useClientEventListener } from './use-real-time-event-listener';

export function RealtimeTranscriptionProvider({
  children,
  ...options
}: React.PropsWithChildren<ConstructorParameters<typeof RealtimeClient>[0]>) {
  const [client] = useState(() => {
    return new RealtimeClient(options);
  });

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