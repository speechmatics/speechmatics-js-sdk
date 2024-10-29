'use client';

import { FlowClient, type FlowClientOptions } from '@speechmatics/flow-client';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { FlowContext } from './flow-context';
import { useClientEventListener } from './use-flow-event-listener';

export function FlowProvider({
  server,
  children,
  ...options
}: React.PropsWithChildren<
  {
    server?: string;
  } & FlowClientOptions
>) {
  const [client] = useState(() => {
    return new FlowClient(server ?? 'wss://flow.api.speechmatics.com', options);
  });

  const socketState = useClientSocketState(client);
  const [sessionId, setSessionId] = useState<string>();

  useClientEventListener(client, 'message', ({ data }) => {
    if (data.message === 'Error') {
      console.error(data);
    } else if (data.message === 'ConversationStarted') {
      setSessionId(data.asr_session_id);
    }
  });

  useClientEventListener(client, 'socketClose', () => {
    setSessionId(undefined);
  });

  const value = useMemo(
    () => ({
      client,
      socketState,
      sessionId,
    }),
    [client, socketState, sessionId],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

const SOCKET_EVENTS = [
  'socketInitialized',
  'socketOpen',
  'socketClosing',
  'socketClose',
  'socketError',
] as const;

function useClientSocketState(client: FlowClient) {
  const subscribe = (onChange: () => void) => {
    for (const e of SOCKET_EVENTS) {
      client.addEventListener(e, onChange);
    }
    return () => {
      for (const e of SOCKET_EVENTS) {
        client.removeEventListener(e, onChange);
      }
    };
  };

  const getSnapshot = () => client.socketState;
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
