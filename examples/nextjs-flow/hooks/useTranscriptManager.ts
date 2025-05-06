import { useFlow, useFlowEventListener } from '@speechmatics/flow-client-react';
import { useState, useMemo, useEffect } from 'react';
import TranscriptManager from '@/lib/transcript-manager';
import type {
  TranscriptGroup,
  TranscriptUpdateEvent,
} from '@/lib/transcript-types';

export function useTranscriptManager() {
  const [transcriptGroups, setTranscriptGroups] = useState<TranscriptGroup[]>(
    [],
  );
  const { sessionId } = useFlow();

  const transcriptManager = useMemo(() => new TranscriptManager(), []);

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

  useFlowEventListener('message', ({ data }) => {
    transcriptManager.handleMessage(data);
  });

  return transcriptGroups;
}
