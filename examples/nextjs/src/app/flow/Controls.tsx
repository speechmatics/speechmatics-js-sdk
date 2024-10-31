import { type ChangeEvent, useState } from 'react';
import { useFlow } from '@speechmatics/flow-client-react';
import { useAudioDevices } from '@speechmatics/browser-audio-input-react';

export function Controls({
  loading,
  personas,
  startSession,
  stopSession,
}: {
  loading: boolean;
  personas: Record<string, { name: string }>;
  startSession: ({
    deviceId,
    personaId,
  }: { deviceId?: string; personaId: string }) => Promise<void>;
  stopSession: () => Promise<void>;
}) {
  const { socketState } = useFlow();
  const connected = socketState === 'open';
  const [personaId, setPersonaId] = useState(Object.keys(personas)[0]);

  const [deviceId, setDeviceId] = useState<string>();

  return (
    <article>
      <div className="grid">
        <MicrophoneSelect setDeviceId={setDeviceId} />
        <label>
          Select persona
          <select
            onChange={(e) => {
              setPersonaId(e.target.value);
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
          onClick={
            connected
              ? stopSession
              : () => startSession({ personaId, deviceId })
          }
        >
          {connected ? 'Stop conversation' : 'Start conversation'}
        </button>
      </div>
    </article>
  );
}

function MicrophoneSelect({
  setDeviceId,
}: { setDeviceId: (deviceId: string) => void }) {
  const devices = useAudioDevices();

  switch (devices.permissionState) {
    case 'prompt':
      return (
        <label>
          Enable mic permissions
          <select
            onClick={devices.promptPermissions}
            onKeyDown={devices.promptPermissions}
          />
        </label>
      );
    case 'prompting':
      return (
        <label>
          Enable mic permissions
          <select aria-busy="true" />
        </label>
      );
    case 'granted': {
      const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setDeviceId(e.target.value);
      };
      return (
        <label>
          Select audio device
          <select onChange={onChange}>
            {devices.deviceList.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      );
    }
    case 'denied':
      return (
        <label>
          Microphone permission disabled
          <select disabled />
        </label>
      );
    default:
      devices satisfies never;
      return null;
  }
}
