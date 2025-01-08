'use client';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { useFlowEventListener } from '@speechmatics/flow-client-react';
import { ErrorFallback } from '@/lib/components/ErrorFallback';

export function OutputView() {
  // TODO show transcript/other output here
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Component />
    </ErrorBoundary>
  );
}

function Component() {
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

  // TODO show transcript/other output here
  return (
    <article>
      <header>Output</header>
    </article>
  );
}
