'use client';
import { type FormEventHandler, useCallback, useState } from 'react';
import { useFlow } from '@speechmatics/flow-client-react';
import { MicrophoneSelect } from '@/lib/components/MicrophoneSelect';
import { PersonaSelect } from './PersonaSelect';

export function Controls({
  personas,
}: { personas: Record<string, { name: string }> }) {
  const { socketState } = useFlow();
  const connected = socketState === 'open';

  const startSession = useCallback<FormEventHandler>((e) => {
    e.preventDefault();
  }, []);

  return (
    <article>
      <form onSubmit={startSession}>
        <div className="grid">
          <MicrophoneSelect />
          <PersonaSelect personas={personas} />
        </div>
        <div className="grid">
          <button type="submit">Start conversation</button>
        </div>
      </form>
    </article>
  );
}
