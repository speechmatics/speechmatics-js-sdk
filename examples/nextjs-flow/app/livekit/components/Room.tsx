'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { start, type StartLivekitResponse } from '../actions';
import {
  ControlBar,
  LiveKitRoom,
  RoomAudioRenderer,
  useDataChannel,
} from '@livekit/components-react';
import '@livekit/components-styles';
import type { fetchPersonas } from '@speechmatics/flow-client-react';
import TranscriptManager from '@/lib/transcript-manager';
import type {
  TranscriptGroup,
  TranscriptUpdateEvent,
} from '@/lib/transcript-types';
import { TranscriptContainer } from '@/components/TranscriptView';

export function Room({
  personas,
}: { personas: Awaited<ReturnType<typeof fetchPersonas>> }) {
  const [state, formAction, pending] = useActionState<
    StartLivekitResponse | null,
    FormData
  >((_, formData: FormData) => start(formData), null);

  if (!state || !state.success) {
    return (
      <form
        className="flex flex-col container m-auto gap-4 p-4"
        action={formAction}
      >
        <h1>Livekit example</h1>
        <select
          name="template"
          className="select select-bordered w-full max-w-x"
          required
          defaultValue=""
        >
          <option value="" disabled>
            Select a template
          </option>
          {Object.entries(personas).map(([id, persona]) => (
            <option key={id} value={id} label={persona.name} />
          ))}
        </select>
        <textarea
          className="textarea textarea-bordered h-32"
          name="persona"
          placeholder="Describe your persona"
          maxLength={500}
        />
        <button className="btn" type="submit" aria-busy={pending}>
          {pending ? (
            <span className="loading loading-spinner" />
          ) : (
            'Start LiveKit Session'
          )}
        </button>
        {!!state?.error && (
          <div role="alert" className="alert alert-error">
            <span>{state.error}</span>
          </div>
        )}
      </form>
    );
  }

  const { livekitURL, livekitToken, sessionID } = state;

  return (
    <LiveKitRoom
      serverUrl={livekitURL}
      token={livekitToken}
      onDisconnected={() => {
        // TODO find a better way to reset
        window.location.reload();
      }}
      className="flex flex-col h-full"
    >
      <Transcript sessionId={sessionID} />
      <RoomAudioRenderer />
      <ControlBar />
    </LiveKitRoom>
  );
}

function Transcript({ sessionId }: { sessionId: string }) {
  const transcriptGroups = useTranscript(sessionId);

  return <TranscriptContainer transcripts={transcriptGroups} />;
}

function useTranscript(sessionId: string) {
  const decoder = useMemo(() => new TextDecoder(), []);
  const transcriptManager = useMemo(() => new TranscriptManager(), []);

  useDataChannel((e) => {
    const stringData = decoder.decode(e.payload);
    const data = JSON.parse(stringData);
    transcriptManager.handleMessage(data);
  });

  const [transcriptGroups, setTranscriptGroups] = useState<TranscriptGroup[]>(
    [],
  );

  // Clear transcripts when session changes
  useEffect(() => {
    if (sessionId) {
      transcriptManager.clearTranscripts();
    }
  }, [sessionId, transcriptManager]);

  useEffect(() => {
    const handleUpdate = (event: TranscriptUpdateEvent) => {
      setTranscriptGroups(event.transcriptGroups);
    };

    transcriptManager.addEventListener('update', handleUpdate);
    return () => {
      transcriptManager.removeEventListener('update', handleUpdate);
    };
  }, [transcriptManager]);

  return transcriptGroups;
}
