'use client';
import { type FormEventHandler, useCallback, useMemo, useState } from 'react';
import {
  type AgentAudioEvent,
  useFlow,
  useFlowEventListener,
} from '@speechmatics/flow-client-react';
import { MicrophoneSelect, Select } from './MicrophoneSelect';
import { getJWT } from '../actions';
import {
  usePcmAudioListener,
  usePcmAudioRecorder,
} from '@speechmatics/browser-audio-input-react';
import { RECORDING_SAMPLE_RATE } from '../lib/constants';
import { usePlayPcm16Audio } from '../lib/audio-hooks';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button = ({ children, className, ...props }: ButtonProps) => (
  <button className={`btn btn-block ${className || ''}`} {...props}>
    {children}
  </button>
);

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

  const actionButton = useMemo(() => {
    if (socketState === 'open' && sessionId) {
      return (
        <Button className="btn-secondary" type="button" onClick={stopSession}>
          End conversation
        </Button>
      );
    }
    if (
      socketState === 'connecting' ||
      socketState === 'closing' ||
      (socketState === 'open' && !sessionId)
    ) {
      return (
        <Button type="button" className="btn-primary" disabled aria-busy>
          <span className="loading loading-spinner" />
        </Button>
      );
    }
    return (
      <Button type="submit" className="btn-primary">
        Start conversation
      </Button>
    );
  }, [socketState, stopSession, sessionId]);

  return (
    <div className="card bg-base-100 shadow-xl">
      <form onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-2">
            <MicrophoneSelect />
            <Select label="Select a persona" name="personaId">
              {Object.entries(personas).map(([id, persona]) => (
                <option key={id} value={id} label={persona.name} />
              ))}
            </Select>
          </div>
          <div className="card-actions">{actionButton}</div>
        </div>
      </form>
    </div>
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
