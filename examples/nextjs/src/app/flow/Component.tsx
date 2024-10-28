'use client';

import { useCallback, useState } from 'react';

import {
  usePcmMicrophoneAudio,
  usePlayPcm16Audio,
} from '../../lib/audio-hooks';
import { ErrorBoundary } from 'react-error-boundary';
import { Controls } from './Controls';
import { Status } from './Status';
import { ErrorFallback } from '../../lib/components/ErrorFallback';
import { OutputView } from './OutputView';
import { useFlow, useFlowOn } from '@speechmatics/flow-client-react';

export default function Component({
  jwt,
  personas,
}: {
  jwt: string;
  personas: Record<string, { name: string }>;
}) {
  const { startConversation, sendAudio, endConversation } = useFlow();

  const [audioContext, setAudioContext] = useState<AudioContext>();

  const playAudio = usePlayPcm16Audio(audioContext);

  useFlowOn('agentAudio', (audio) => {
    playAudio(audio.data);
  });

  const [loading, setLoading] = useState(false);

  const [mediaStream, setMediaStream] = useState<MediaStream>();

  const { startRecording, stopRecording, isRecording } = usePcmMicrophoneAudio(
    (audio) => {
      sendAudio(audio);
    },
  );

  const startSession = useCallback(
    async (personaId: string) => {
      try {
        setLoading(true);
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
        const mediaStream = await startRecording(audioContext);
        setMediaStream(mediaStream);
      } finally {
        setLoading(false);
      }
    },
    [startConversation, jwt, startRecording],
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
