'use client';
import { useErrorBoundary } from 'react-error-boundary';
import {
  useFlowEventListener,
  useFlowTranscript,
} from '@speechmatics/flow-client-react';

export function OutputView() {
  useErrorView();

  const { transcript, clearTranscript } = useFlowTranscript();

  useFlowEventListener('message', ({ data }) => {
    if (data.message === 'ConversationStarted' && transcript.length) {
      clearTranscript();
    }
  });

  return (
    <article>
      <header>Output</header>
      <section>
        {transcript.map((item) => (
          <article key={`${item.startTime}-${item.endTime}`}>
            <header>{item.speaker}</header>
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
  useFlowEventListener('message', ({ data }) => {
    if (data.message === 'Error') {
      showBoundary(data);
    }
  });

  useFlowEventListener('socketError', (e) => {
    showBoundary(e);
  });
}
