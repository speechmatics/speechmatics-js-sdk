import { useErrorBoundary } from 'react-error-boundary';
import { useFlowOn } from '@speechmatics/flow-client-react';

export function OutputView() {
  const { showBoundary } = useErrorBoundary();

  // Show error boundary on both socket errors and error messages from server
  useFlowOn('message', ({ data }) => {
    if (data.message === 'Error') {
      showBoundary(data);
    }
  });

  useFlowOn('socketError', (e) => {
    showBoundary(e);
  });

  return (
    <article>
      <header>Transcript</header>
    </article>
  );
}
