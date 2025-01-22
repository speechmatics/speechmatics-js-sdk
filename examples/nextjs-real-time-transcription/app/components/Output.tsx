'use client';
import { useReducer } from 'react';
import {
  type RealtimeServerMessage,
  useRealtimeEventListener,
} from '@speechmatics/real-time-client-react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';
import { AudioVisualizer } from './AudioVisualizer';
import { usePCMAudioRecorder } from '@speechmatics/browser-audio-input-react';

export function Output() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Component />
    </ErrorBoundary>
  );
}

export function Component() {
  const [transcription, dispatch] = useReducer(transcriptReducer, []);

  useRealtimeEventListener('receiveMessage', (e) => dispatch(e.data));
  const { analyser } = usePCMAudioRecorder();

  return (
    <article>
      <header>
        Output &nbsp;&nbsp;
        <AudioVisualizer analyser={analyser} />
      </header>
      <p>
        {transcription.map(({ text, startTime, endTime, punctuation }) => (
          <span key={`${text}-${startTime}-${endTime}`}>
            {!punctuation && ' '}
            {text}
          </span>
        ))}
      </p>
    </article>
  );
}

interface Word {
  text: string;
  startTime: number;
  endTime: number;
  punctuation: boolean;
  partial?: boolean;
}

function transcriptReducer(
  words: readonly Word[],
  event: RealtimeServerMessage,
): readonly Word[] {
  if (event.message === 'AddTranscript') {
    return [
      ...words.filter((w) => !w.partial),
      ...event.results.map((result) => ({
        text: result.alternatives?.[0].content ?? '',
        startTime: result.start_time ?? 0,
        endTime: result.end_time ?? 0,
        punctuation: result.type === 'punctuation',
      })),
    ];
  }

  if (event.message === 'AddPartialTranscript') {
    return [
      ...words.filter((w) => !w.partial),
      ...event.results.map((result) => ({
        text: result.alternatives?.[0].content ?? '',
        startTime: result.start_time ?? 0,
        endTime: result.end_time ?? 0,
        punctuation: result.type === 'punctuation',
        partial: true,
      })),
    ];
  }

  return words;
}
