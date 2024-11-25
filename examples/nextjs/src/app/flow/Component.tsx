'use client';

import { use, useCallback, useState } from 'react';

import { usePlayPcm16Audio } from '../../lib/audio-hooks';
import { ErrorBoundary } from 'react-error-boundary';
import { Controls } from './Controls';
import { Status } from './Status';
import { ErrorFallback } from '../../lib/components/ErrorFallback';
import { OutputView } from './OutputView';
import { useFlow, useFlowEventListener } from '@speechmatics/flow-client-react';
import { getJWT } from '../actions';
import {
  usePcmAudioListener,
  usePcmAudioRecorder,
} from '@speechmatics/browser-audio-input-react';

export default function Component({
  personas,
}: {
  personas: Record<string, { name: string }>;
}) {
  const { startConversation, sendAudio, endConversation } = useFlow();

  const [audioContext, setAudioContext] = useState<AudioContext>();

  const playAudio = usePlayPcm16Audio(audioContext);

  useFlowEventListener('agentAudio', (audio) => {
    playAudio(audio.data);
  });

  const [loading, setLoading] = useState(false);

  const { startRecording, stopRecording, mediaStream, isRecording } =
    usePcmAudioRecorder();

  usePcmAudioListener((audio) => {
    sendAudio(audio);
  });

  const startSession = useCallback(
    async ({
      personaId,
      deviceId,
    }: { personaId: string; deviceId?: string }) => {
      try {
        setLoading(true);

        const jwt = await getJWT('flow');

        const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
        setAudioContext(audioContext);

        await startConversation(jwt, {
          config: {
            template_id: personaId,
            template_variables: {},
          },
          audioFormat: {
            type: 'raw',
            encoding: 'pcm_f32le',
            sample_rate: SAMPLE_RATE,
          },
        });

        await startRecording({ audioContext, deviceId });
      } finally {
        setLoading(false);
      }
    },
    [startConversation, startRecording],
  );

  const stopSession = useCallback(async () => {
    endConversation();
    stopRecording();
    await audioContext?.close();
  }, [endConversation, stopRecording, audioContext]);

  return (
    <section>
      <h3>Flow Example</h3>
      <section className="grid">
        <Controls
          personas={personas}
          loading={loading}
          startSession={startSession}
          stopSession={stopSession}
        />
        <Status isRecording={isRecording} />
      </section>
      <section>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <OutputView />
        </ErrorBoundary>
      </section>
    </section>
  );
}

const SAMPLE_RATE = 16_000;
