'use client';
import { useFlow } from '@speechmatics/flow-client-react';
import { useCallback, type FormEventHandler } from 'react';
import { useFlowWithBrowserAudio } from '../hooks/useFlowWithBrowserAudio';
import { MicrophoneSelect, Select } from './MicrophoneSelect';
import Card from './Card';
import { usePCMAudioRecorder } from '@speechmatics/browser-audio-input-react';

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
  const { socketState, sessionId } = useFlow();
  const { startSession, stopSession } = useFlowWithBrowserAudio();

  const handleSubmit = useCallback<FormEventHandler>(
    async (e) => {
      e.preventDefault();

      if (socketState === 'open' && sessionId) {
        return stopSession();
      }

      const formData = new FormData(e.target as HTMLFormElement);

      const personaId = formData.get('personaId')?.toString();
      if (!personaId) throw new Error('No persona selected!');

      const deviceId = formData.get('deviceId')?.toString();
      if (!deviceId) throw new Error('No device selected!');

      startSession({ personaId, deviceId });
    },
    [startSession, stopSession, socketState, sessionId],
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
          <MuteButton />
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

function MuteButton() {
  const { isRecording, mute, unmute, isMuted } = usePCMAudioRecorder();
  if (!isRecording) return null;

  return (
    <Button type="button" onClick={isMuted ? unmute : mute}>
      {isMuted ? 'Unmute' : 'Mute'}
    </Button>
  );
}
