import {
  useFlow,
  useFlowEventListener,
  type FlowProvider,
} from '@speechmatics/flow-client-react';
import { useState, useMemo, useEffect } from 'react';
import TranscriptManager from './transcript-manager';
import type { TranscriptGroup, TranscriptUpdateEvent } from './types';

/**
 * A hook that returns the current transcript groups for a Flow session.
 *
 * Must only be called in a component which is a child of a {@link FlowProvider}.
 *
 * @returns The current transcript groups for the Flow session.
 *
 * @example
 *
 * ```tsx
 * import { useFlowTranscript, transcriptGroupKey, wordsToText } from '@speechmatics/use-flow-transcript';
 *
 * const transcriptGroups = useFlowTranscript();
 *
 * return (
 *  <div>
 *    {transcriptGroups.map((group) => (
 *      <div key={transcriptGroupKey(group)}>
 *        {group.type === 'speaker' ? (
 *          <span>{wordsToText(group.data)}</span>
 *        ) : (
 *          <span>
 *              {group.data.map((response) => response.text).join(' ')}
 *          </span>
 *        )}
 *      </div>
 *    ))}
 *  </div>
 * )
 * ```
 */
export function useFlowTranscript() {
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
