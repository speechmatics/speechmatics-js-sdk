import { useErrorBoundary } from 'react-error-boundary';
import { useFlowEventListener } from '@speechmatics/flow-client-react';

export function OutputView() {
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
  return null;
}
