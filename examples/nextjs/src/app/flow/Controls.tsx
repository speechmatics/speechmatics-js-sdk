'use client';
import { type FormEventHandler, useCallback, useMemo, useState } from 'react';
import {
  type AgentAudioEvent,
  useFlow,
  useFlowEventListener,
} from '@speechmatics/flow-client-react';
import { MicrophoneSelect } from '@/lib/components/MicrophoneSelect';
import { PersonaSelect } from './PersonaSelect';
import { getJWT } from '../actions';
import {
  usePcmAudioListener,
  usePcmAudioRecorder,
} from '@speechmatics/browser-audio-input-react';
import { RECORDING_SAMPLE_RATE } from '@/lib/constants';
import { usePlayPcm16Audio } from '@/lib/audio-hooks';

export function Controls({
  personas,
}: { personas: Record<string, { name: string }> }) {
  const { socketState, sessionId } = useFlow();

  const { startSession, stopSession } = useFlowWithBrowserAudio();

  const handleSubmit = useCallback<FormEventHandler>(
    async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target as HTMLFormElement);

      const personaId = formData.get('personaId')?.toString();
      if (!personaId) throw new Error('No persona selected!');

      const deviceId = formData.get('deviceId')?.toString();
      if (!deviceId) throw new Error('No device selected!');

      startSession({ personaId, deviceId });
    },
    [startSession],
  );

  const button = useMemo(() => {
    if (socketState === 'open' && sessionId) {
      return (
        <button type="button" onClick={stopSession}>
          End conversation
        </button>
      );
    }
    if (
      socketState === 'connecting' ||
      socketState === 'closing' ||
      (socketState === 'open' && !sessionId)
    ) {
      return <button type="button" disabled aria-busy />;
    }
    return <button type="submit">Start conversation</button>;
  }, [socketState, stopSession, sessionId]);

  return (
    <article>
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <MicrophoneSelect />
          <PersonaSelect personas={personas} />
        </div>
        <div className="grid">{button}</div>
      </form>
    </article>
  );
}

// Hook to set up two way audio between the browser and Flow
function useFlowWithBrowserAudio() {
  const { startConversation, endConversation, sendAudio } = useFlow();
  const { startRecording, stopRecording } = usePcmAudioRecorder();
  const [audioContext, setAudioContext] = useState<AudioContext>();
  const playAudio = usePlayPcm16Audio(audioContext);

  // Send audio to Flow when we receive it from the active input device
  usePcmAudioListener(sendAudio);

  // Play back audio when we receive it from flow
  useFlowEventListener(
    'agentAudio',
    useCallback(
      ({ data }: AgentAudioEvent) => {
        playAudio(data);
      },
      [playAudio],
    ),
  );

  const startSession = useCallback(
    async ({
      personaId,
      deviceId,
    }: { personaId: string; deviceId: string }) => {
      const jwt = await getJWT('flow');

      await startConversation(jwt, {
        config: {
          template_id: personaId,
          template_variables: {},
        },
        audioFormat: {
          type: 'raw',
          encoding: 'pcm_f32le',
          sample_rate: RECORDING_SAMPLE_RATE,
        },
      });

      const audioContext = new AudioContext({
        sampleRate: RECORDING_SAMPLE_RATE,
      });
      setAudioContext(audioContext);

      await startRecording({ deviceId, sampleRate: RECORDING_SAMPLE_RATE });
    },
    [startConversation, startRecording],
  );

  const stopSession = useCallback(async () => {
    endConversation();
    stopRecording();
  }, [endConversation, stopRecording]);

  return { startSession, stopSession };
}
