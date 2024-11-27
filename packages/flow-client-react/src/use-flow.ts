import type { FlowClientOutgoingMessage, StartConversationMessage } from '@speechmatics/flow-client';
import { useCallback, useContext, useMemo } from 'react';
import { FlowContext } from './flow-context';

export function useFlow() {
  const context = useContext(FlowContext);

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

  const sendWebsocketMessage = useCallback(
    (wsMessage: FlowClientOutgoingMessage) => client.sendWebsocketMessage(wsMessage),
    [client],
  )

  return useMemo(
    () => ({
      startConversation,
      endConversation,
      sendAudio,
      sendWebsocketMessage,
      socketState,
      sessionId,
    }),
    [startConversation, endConversation, sendAudio, socketState, sessionId, sendWebsocketMessage],
  );
}
