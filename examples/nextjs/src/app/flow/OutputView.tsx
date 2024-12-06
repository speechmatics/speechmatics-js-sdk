'use client';
import { useErrorBoundary } from 'react-error-boundary';
import {
  type FlowMessageCallback,
  type FlowSocketErrorCallback,
  useFlowEventListener,
  useFlowTranscript,
} from '@speechmatics/flow-client-react';
import { useCallback } from 'react';

export function OutputView() {
  useErrorView();

  const { transcript, clearTranscript } = useFlowTranscript();

  useFlowEventListener(
    'message',
    useCallback<FlowMessageCallback>(
      ({ data }) => {
        if (data.message === 'ConversationStarted' && transcript.length) {
          clearTranscript();
        }
      },
      [clearTranscript, transcript],
    ),
  );

  return (
    <article>
      <header>Output</header>
      <section>
        {transcript.map((item) => (
          <article key={`${item.startTime}-${item.endTime}`}>
            <header className="grid">
              {item.speaker}
              <time dateTime={`PT${item.startTime}M`}>
                {item.startTime}s &mdash;{' '}
                {item.endTime ? `${item.endTime}s` : '?'}
              </time>
            </header>
            <span>
              {item.text}
              <i style={{ color: 'gray' }}>{item.partialText}</i>
            </span>
          </article>
        ))}
      </section>
    </article>
  );
}

function useErrorView() {
  const { showBoundary } = useErrorBoundary();

  // Show error boundary on both socket errors and error messages from server
  useFlowEventListener(
    'message',
    useCallback<FlowMessageCallback>(
      ({ data }) => {
        if (data.message === 'Error') {
          showBoundary(data);
        }
      },
      [showBoundary],
    ),
  );

  useFlowEventListener(
    'socketError',
    useCallback<FlowSocketErrorCallback>(
      (e) => {
        showBoundary(e);
      },
      [showBoundary],
    ),
  );
}
