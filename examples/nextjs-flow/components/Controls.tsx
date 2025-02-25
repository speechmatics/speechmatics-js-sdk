'use client';
import { useFlow } from '@speechmatics/flow-client-react';
import { useCallback, type FormEventHandler } from 'react';
import { useFlowWithBrowserAudio } from '../hooks/useFlowWithBrowserAudio';
import { MicrophoneSelect, Select } from './MicrophoneSelect';
import Card from './Card';
import { usePCMAudioRecorder } from '@speechmatics/browser-audio-input-react';
import { useStartFlowSession } from '@/hooks/useStartFlowSession';
import { getJWT } from '@/app/actions';

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
  const { startConversation, endConversation, socketState, sessionId } =
    useFlow();

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

      if (socketState === 'open' && sessionId) {
        return endConversation();
      }

      const formData = new FormData(e.target as HTMLFormElement);

      const personaId = formData.get('personaId')?.toString();
      if (!personaId) throw new Error('No persona selected!');

      const deviceId = formData.get('deviceId')?.toString();
      if (!deviceId) throw new Error('No device selected!');

      startSession({ personaId, recordingSampleRate: 16000 });
    },
    [startSession, endConversation, socketState, sessionId],
  );

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
      <Button type="button" className="btn-primary" disabled aria-busy>
        <span className="loading loading-spinner" />
      </Button>
    );
  }

  const running = socketState === 'open' && sessionId;
  return (
    <Button type="submit" className={running ? 'btn-accent' : 'btn-primary'}>
      {running ? 'Stop' : 'Start'}
    </Button>
  );
}

function MuteMicrophoneButton() {
  const { isRecording, mute, unmute, isMuted } = usePCMAudioRecorder();
  if (!isRecording) return null;

  return (
    <Button type="button" onClick={isMuted ? unmute : mute}>
      {isMuted ? 'Unmute microphone' : 'Mute microphone'}
    </Button>
  );
}
