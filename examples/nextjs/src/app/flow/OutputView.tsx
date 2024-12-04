import { useErrorBoundary } from 'react-error-boundary';
import { useFlowEventListener } from '@speechmatics/flow-client-react';
import { useFlowTranscript } from './useFlowTranscript';

export function OutputView() {
  useErrorView();

  const { messages, handleEvent } = useFlowTranscript();

  useFlowEventListener('message', ({ data }) => {
    if (
      data.message === 'AddTranscript' ||
      data.message === 'AddPartialTranscript' ||
      data.message === 'ResponseStarted' ||
      data.message === 'ResponseCompleted'
    ) {
      handleEvent(data);
    }
  });

  return (
    <article>
      <header>Output</header>
      <section>
        {messages.map((message) => (
          <article key={`${message.startTime}-${message.endTime}`}>
            <header>{message.speaker}</header>
            <span>
              {message.text}
              <i style={{ color: 'gray' }}>{message.partialText}</i>
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
