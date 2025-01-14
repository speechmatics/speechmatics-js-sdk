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
  usePCMAudioListener,
  usePCMAudioRecorder,
} from '@speechmatics/browser-audio-input-react';
import { RECORDING_SAMPLE_RATE } from '@/lib/constants';

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
  const {
    startConversation,
    endConversation,
    sendAudio,
    createAgentAudioPlaybackNode,
  } = useFlow();
  const { startRecording, stopRecording } = usePCMAudioRecorder();
  const [audioContext, setAudioContext] = useState<AudioContext>();
  const [playbackAudioContext, setPlaybackAudioContext] =
    useState<AudioContext>();

  // Send audio to Flow when we receive it from the active input device
  usePCMAudioListener(sendAudio);

  // Play back audio when we receive it from flow

  const startSession = useCallback(
    async ({
      personaId,
      deviceId,
    }: { personaId: string; deviceId: string }) => {
      const audioContext = new AudioContext({
        sampleRate: RECORDING_SAMPLE_RATE,
      });
      setAudioContext(audioContext);

      const playbackAudioContext =
        navigator.userAgent.search('Firefox') > 0
          ? new AudioContext({ sampleRate: 16000 })
          : audioContext;

      setPlaybackAudioContext(playbackAudioContext);

      const playbackNode = await createAgentAudioPlaybackNode({
        context: playbackAudioContext,
        processorScriptURL: '/js/agent-audio-processor.js',
      });
      playbackNode.connect(playbackAudioContext.destination);

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

      await startRecording({ deviceId, audioContext });
    },
    [startConversation, startRecording, createAgentAudioPlaybackNode],
  );

  const stopSession = useCallback(async () => {
    endConversation();
    stopRecording();
    audioContext?.close();
    playbackAudioContext?.close();
  }, [endConversation, stopRecording, audioContext, playbackAudioContext]);

  return { startSession, stopSession };
}
