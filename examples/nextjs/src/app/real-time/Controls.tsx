import { type ChangeEvent, useState } from 'react';
import { useAudioDevices } from '@speechmatics/browser-audio-input-react';
import { useRealtimeTranscription } from '@speechmatics/real-time-client-react';

export function Controls({
  loading,
  startSession,
  stopSession,
}: {
  loading: boolean;
  personas: Record<string, { name: string }>;
  startSession: ({ deviceId }: { deviceId?: string }) => Promise<void>;
  stopSession: () => Promise<void>;
}) {
  const { socketState } = useRealtimeTranscription();
  const connected = socketState === 'open';

  const [deviceId, setDeviceId] = useState<string>();

  return (
    <article>
      <div className="grid">
        <MicrophoneSelect setDeviceId={setDeviceId} />
      </div>
      <div className="grid">
        <button
          type="button"
          className={connected ? 'secondary' : undefined}
          aria-busy={loading}
          onClick={connected ? stopSession : () => startSession({ deviceId })}
        >
          {connected ? 'Stop transcription' : 'Start transcription'}
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
