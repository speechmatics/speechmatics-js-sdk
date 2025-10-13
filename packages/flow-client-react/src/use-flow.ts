import type { AddInput, StartConversation, ToolResult } from '@speechmatics/flow-client';
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
        config: StartConversation['conversation_config'];
        audioFormat?: StartConversation['audio_format'];
      },
    ) => client.startConversation(jwt, { config, audioFormat }),
    [client],
  );

  const endConversation = useCallback(() => client.endConversation(), [client]);

  const sendAudio = useCallback(
    (pcm16Data: ArrayBufferLike) => client.sendAudio(pcm16Data),
    [client],
  );

  const sendToolResult = useCallback(
    (toolResult: Exclude<ToolResult, 'message'>) =>
      client.sendToolResult(toolResult),
    [client],
  );

  const sendInput = useCallback(
    (input: Exclude<AddInput, 'message'>) => client.sendInput(input),
    [client],
  );

  return useMemo(
    () => ({
      startConversation,
      endConversation,
      sendAudio,
      socketState,
      sessionId,
      sendToolResult,
      sendInput,
    }),
    [startConversation, endConversation, sendAudio, socketState, sessionId, sendToolResult, sendInput],
  );
}
