import { type ChangeEvent, type FormEvent, useCallback, useState } from 'react';
import {
  useAudioDevices,
  usePcmAudioRecorder,
} from '@speechmatics/browser-audio-input-react';
import {
  type RealtimeTranscriptionConfig,
  useRealtimeTranscription,
} from '@speechmatics/real-time-client-react';
import { getJWT } from '../actions';
import { configFromFormData } from '@/lib/real-time/config-from-form-data';
import { RECORDING_SAMPLE_RATE } from '@/lib/constants';

export function Controls() {
  const { startTranscription } = useRealtimeTranscription();
  const { startRecording } = usePcmAudioRecorder();

  const [deviceId, setDeviceId] = useState<string>();

  const startSession = useCallback(
    async (config: RealtimeTranscriptionConfig) => {
      const jwt = await getJWT('rt');
      await startTranscription(jwt, config);
      await startRecording({ deviceId, sampleRate: RECORDING_SAMPLE_RATE });
    },
    [startTranscription, startRecording, deviceId],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const config = configFromFormData(formData);
      config.audio_format = {
        type: 'raw',
        encoding: 'pcm_f32le',
        sample_rate: RECORDING_SAMPLE_RATE,
      };
      startSession(config);
    },
    [startSession],
  );

  return (
    <article>
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <MicrophoneSelect setDeviceId={setDeviceId} />
          <label>
            Select language
            <select name="language">
              <option value="en" label="English" defaultChecked />
              <option value="es" label="Spanish" />
              <option value="ar" label="Arabic" />
            </select>
          </label>
        </div>
        <div className="grid">
          <StartStopButton />
        </div>
      </form>
    </article>
  );
}

function StartStopButton() {
  const { stopRecording } = usePcmAudioRecorder();
  const { stopTranscription } = useRealtimeTranscription();

  const stopSession = useCallback(() => {
    stopTranscription();
    stopRecording();
  }, [stopRecording, stopTranscription]);

  const connected = useRealtimeTranscription().socketState === 'open';

  if (connected) {
    return (
      <button type="button" onClick={stopSession}>
        Stop transcription
      </button>
    );
  }

  return <button type="submit">Transcribe audio</button>;
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
