'use client';
import { type FormEventHandler, useCallback, useState } from 'react';
import { useFlow } from '@speechmatics/flow-client-react';

export function Controls({ children }: React.PropsWithChildren) {
  const { socketState } = useFlow();
  const connected = socketState === 'open';

  const [deviceId, setDeviceId] = useState<string>();

  const startSession = useCallback<FormEventHandler>((e) => {
    e.preventDefault();
  }, []);

  return (
    <article>
      <form onSubmit={startSession}>
        <div className="grid">{children}</div>
        <div className="grid">
          <button type="submit">Start conversation</button>
        </div>
      </form>
    </article>
  );
}
