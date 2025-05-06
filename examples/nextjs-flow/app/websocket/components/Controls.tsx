'use client';
import { useFlow, useFlowEventListener } from '@speechmatics/flow-client-react';
import { useCallback, type FormEventHandler } from 'react';
import { MicrophoneSelect, Select } from '@/components/MicrophoneSelect';
import Card from '@/components/Card';
import {
  usePCMAudioListener,
  usePCMAudioRecorderContext,
} from '@speechmatics/browser-audio-input-react';
import { getJWT } from '@/app/actions';
import { usePCMAudioPlayerContext } from '@speechmatics/web-pcm-player-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button = ({ children, className, ...props }: ButtonProps) => (
  <button className={`btn flex-1 text-md ${className || ''}`} {...props}>
    {children}
  </button>
);

export function Controls({
  personas,
}: { personas: Record<string, { name: string }> }) {
  const {
    startConversation,
    endConversation,
    sendAudio,
    socketState,
    sessionId,
  } = useFlow();

  const { startRecording, stopRecording, audioContext } =
    usePCMAudioRecorderContext();

  const startSession = useCallback(
    async ({
      personaId,
      recordingSampleRate,
    }: { personaId: string; recordingSampleRate: number }) => {
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
          sample_rate: recordingSampleRate,
        },
      });
    },
    [startConversation],
  );

  const handleSubmit = useCallback<FormEventHandler>(
    async (e) => {
      e.preventDefault();

      if (!audioContext) {
        throw new Error('Audio context not initialized!');
      }

      if (socketState === 'open' && sessionId) {
        stopRecording();
        endConversation();
        return;
      }

      const formData = new FormData(e.target as HTMLFormElement);

      const personaId = formData.get('personaId')?.toString();
      if (!personaId) throw new Error('No persona selected!');

      const deviceId = formData.get('deviceId')?.toString();
      if (!deviceId) throw new Error('No device selected!');

      await startSession({
        personaId,
        recordingSampleRate: audioContext.sampleRate,
      });
      await startRecording({ deviceId });
    },
    [
      startSession,
      startRecording,
      stopRecording,
      endConversation,
      socketState,
      sessionId,
      audioContext,
    ],
  );

  const { playAudio } = usePCMAudioPlayerContext();

  usePCMAudioListener(sendAudio);
  useFlowEventListener('agentAudio', ({ data }) => playAudio(data));

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <MicrophoneSelect />
          <Select label="Select a persona" name="personaId">
            {Object.entries(personas).map(([id, persona]) => (
              <option key={id} value={id} label={persona.name} />
            ))}
          </Select>
        </div>
        <div className="card-actions mt-4">
          <ActionButton />
          <MuteMicrophoneButton />
        </div>
      </form>
    </Card>
  );
}

function ActionButton() {
  const { socketState, sessionId } = useFlow();

  if (
    socketState === 'connecting' ||
    socketState === 'closing' ||
    (socketState === 'open' && !sessionId)
  ) {
    return (
      <Button type="button" className="btn" disabled aria-busy>
        <span className="loading loading-spinner" />
      </Button>
    );
  }

  const running = socketState === 'open' && sessionId;
  return (
    <Button type="submit" className={running ? 'btn-accent' : 'btn'}>
      {running ? 'Stop' : 'Start'}
    </Button>
  );
}

function MuteMicrophoneButton() {
  const { isRecording, mute, unmute, isMuted } = usePCMAudioRecorderContext();
  if (!isRecording) return null;

  return (
    <Button type="button" onClick={isMuted ? unmute : mute}>
      {isMuted ? 'Unmute microphone' : 'Mute microphone'}
    </Button>
  );
}
