'use client';
import { useCallback, useState } from 'react';
import {
  type AgentAudioEvent,
  useFlow,
  useFlowEventListener,
} from '@speechmatics/flow-client-react';
import { getJWT } from '../actions';
import {
  usePcmAudioListener,
  usePcmAudioRecorder,
} from '@speechmatics/browser-audio-input-react';
import { RECORDING_SAMPLE_RATE } from '../lib/constants';
import { usePlayPcm16Audio } from '../lib/audio-hooks';

// Hook to set up two way audio between the browser and Flow
export function useFlowWithBrowserAudio() {
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
          template_variables: {
            // We can set up any template variables here
          },
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

      await startRecording({
        deviceId,
        sampleRate: RECORDING_SAMPLE_RATE,
        audioContext,
        recordingOptions: {
          echoCancellation: true,
        },
      });
    },
    [startConversation, startRecording],
  );

  const stopSession = useCallback(async () => {
    endConversation();
    stopRecording();
  }, [endConversation, stopRecording]);

  return { startSession, stopSession };
}
