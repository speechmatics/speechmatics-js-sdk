import type {
  FlowClientEventMap,
  StartConversationMessage,
} from '@speechmatics/flow-client';

import { useCallback, useContext, useMemo } from 'react';

import type { TypedEventListenerOrEventListenerObject } from 'typescript-event-target';
import { FlowClientContext } from './flow-context';
import { useClientEventListener } from './use-client-event-listener';

export function useFlow() {
  const context = useContext(FlowClientContext);

  if (context === null) {
    throw new Error('Flow client uninitialized in context');
  }

  const { client, sessionId, socketState } = context;

  const startConversation = useCallback(
    (
      jwt: string,
      {
        config,
        audioFormat,
      }: {
        config: StartConversationMessage['conversation_config'];
        audioFormat?: StartConversationMessage['audio_format'];
      },
    ) => client.startConversation(jwt, { config, audioFormat }),
    [client],
  );

  const endConversation = useCallback(() => client.endConversation(), [client]);

  const sendAudio = useCallback(
    (pcm16Data: ArrayBufferLike) => client.sendAudio(pcm16Data),
    [client],
  );

  return useMemo(
    () => ({
      startConversation,
      endConversation,
      sendAudio,
      socketState,
      sessionId,
    }),
    [startConversation, endConversation, sendAudio, socketState, sessionId],
  );
}

export function useFlowOn<E extends keyof FlowClientEventMap>(
  message: E,
  cb: TypedEventListenerOrEventListenerObject<FlowClientEventMap, E>,
) {
  const context = useContext(FlowClientContext);
  if (context === null) {
    throw new Error('Flow client uninitialized in context');
  }

  return useClientEventListener(context.client, message, cb);
}
