import { useState } from 'react';
import { useFlow } from '@speechmatics/flow-client-react';

export function Controls({
  loading,
  personas,
  startSession,
  stopSession,
}: {
  loading: boolean;
  personas: Record<string, { name: string }>;
  startSession: (personaId: string) => Promise<void>;
  stopSession: () => Promise<void>;
}) {
  const { socketState } = useFlow();
  const connected = socketState === 'open';
  const [persona, setPersona] = useState(Object.keys(personas)[0]);

  return (
    <article>
      <div className="grid">
        <label aria-invalid="true">
          Select input device
          <select />
        </label>
        <label>
          Select persona
          <select
            onChange={(e) => {
              setPersona(e.target.value);
            }}
          >
            {Object.entries(personas).map(([id, { name }]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid">
        <button
          type="button"
          className={connected ? 'secondary' : undefined}
          aria-busy={loading}
          onClick={connected ? stopSession : () => startSession(persona)}
        >
          {connected ? 'Stop conversation' : 'Start conversation'}
        </button>
      </div>
    </article>
  );
}
