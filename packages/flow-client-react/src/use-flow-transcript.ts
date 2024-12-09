'use client';
import {
  useSpeakerDiarizedTranscription,
  type SpeakerDiarizedTranscriptionItem,
  type SpeakerDiarizedTranscriptionChunk,
} from '@speechmatics/use-diarized-transcription';
import { useFlowEventListener } from './use-flow-event-listener';
import { useCallback } from 'react';
import type { FlowIncomingMessageEvent } from '@speechmatics/flow-client';
import type { FlowMessageCallback } from '@speechmatics/flow-client';

export function useFlowTranscript() {
  const { transcriptionItems, handleTranscriptionChunk, clearTranscript } =
    useSpeakerDiarizedTranscription();

  useFlowEventListener(
    'message',
    useCallback<FlowMessageCallback>(
      ({ data }) => {
        if (
          data.message === 'AddPartialTranscript' ||
          data.message === 'AddTranscript'
        ) {
          const type =
            data.message === 'AddPartialTranscript' ? 'partial' : 'final';
          handleTranscriptionChunk(type, {
            speaker: data.results?.[0]?.alternatives?.[0]?.speaker ?? 'Unknown',
            text: data.metadata.transcript,
            startTime: data.metadata.start_time,
            endTime: data.metadata.end_time,
          });
        } else if (
          data.message === 'ResponseStarted' ||
          data.message === 'ResponseCompleted' ||
          data.message === 'ResponseInterrupted'
        ) {
          const type = data.message === 'ResponseStarted' ? 'partial' : 'final';
          handleTranscriptionChunk(type, {
            speaker: 'agent',
            text: `${data.content} `,
            startTime: data.start_time,
            endTime: 'end_time' in data ? data.end_time : undefined,
          });
        }
      },
      [handleTranscriptionChunk],
    ),
  );

  return { transcript: transcriptionItems, clearTranscript };
}

export type {
  SpeakerDiarizedTranscriptionItem,
  SpeakerDiarizedTranscriptionChunk,
};
