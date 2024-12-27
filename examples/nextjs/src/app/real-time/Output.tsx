'use client';
import { useReducer } from 'react';
import {
  type RealtimeServerMessage,
  useRealtimeEventListener,
} from '@speechmatics/real-time-client-react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/lib/components/ErrorFallback';

export function Output() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Component />
    </ErrorBoundary>
  );
}

export function Component() {
  const [transcription, dispatch] = useReducer(transcriptReducer, '');

  useRealtimeEventListener('receiveMessage', (e) => dispatch(e.data));

  return (
    <article>
      <header>Output</header>
      <p>{transcription}</p>
    </article>
  );
}

function transcriptReducer(acc: string, event: RealtimeServerMessage) {
  if (event.message === 'AddTranscript') {
    return `${acc} ${event.results.map((result) => result.alternatives?.[0].content).join(' ')}`;
  }

  return acc;
}
