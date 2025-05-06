'use client';
import { type FormEvent, useCallback, useEffect } from 'react';
import {
  usePCMAudioListener,
  usePCMAudioRecorderContext,
} from '@speechmatics/browser-audio-input-react';
import {
  type RealtimeTranscriptionConfig,
  useRealtimeTranscription,
} from '@speechmatics/real-time-client-react';
import { getJWT } from '@/app/actions';
import { configFromFormData } from '@/lib/config-from-form-data';
import { RECORDING_SAMPLE_RATE } from '@/lib/constants';
import { MicrophoneSelect } from './MicrophoneSelect';
import { LanguageSelect } from './LanguageSelect';

export function Controls({
  languages,
}: { languages: (readonly [code: string, displayName: string])[] }) {
  const { startTranscription, stopTranscription, sendAudio } =
    useRealtimeTranscription();

  const { isRecording, startRecording, stopRecording } =
    usePCMAudioRecorderContext();

  usePCMAudioListener(sendAudio);

  const startSession = useCallback(
    async ({
      deviceId,
      ...config
    }: RealtimeTranscriptionConfig & { deviceId?: string }) => {
      const jwt = await getJWT('rt');
      await startTranscription(jwt, config);
      await startRecording({ deviceId });
    },
    [startTranscription, startRecording],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const config = configFromFormData(formData);
      const deviceId = formData.get('deviceId')?.toString();
      config.audio_format = {
        type: 'raw',
        encoding: 'pcm_f32le',
        sample_rate: RECORDING_SAMPLE_RATE,
      };
      startSession({ deviceId, ...config });
    },
    [startSession],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      stopTranscription();
      stopRecording();
    };
  }, [stopTranscription, stopRecording]);

  return (
    <article>
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <MicrophoneSelect disabled={isRecording} />
          <LanguageSelect languages={languages} disabled={isRecording} />
        </div>
        <div className="grid">
          <StartStopButton />
        </div>
      </form>
    </article>
  );
}

function StartStopButton() {
  const { stopRecording } = usePCMAudioRecorderContext();
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
