import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import {
  SpeakerDiarizedTranscription,
  type SpeakerDiarizedTranscriptionItem,
  type SpeakerDiarizedTranscriptionChunk,
} from '@speechmatics/diarized-transcription';

export function useSpeakerDiarizedTranscription() {
  const [diarizedTranscription] = useState(
    () => new SpeakerDiarizedTranscription(),
  );

  const transcriptionItems = useSyncExternalStore(
    (onChange: () => void) => {
      diarizedTranscription.addEventListener('change', onChange);
      return () => {
        diarizedTranscription.removeEventListener('change', onChange);
      };
    },
    () => diarizedTranscription.items,
    () => diarizedTranscription.items,
  );

  const handleTranscriptionChunk = useCallback<
    SpeakerDiarizedTranscription['handleTranscriptionChunk']
  >(
    (type, chunk) =>
      diarizedTranscription.handleTranscriptionChunk(type, chunk),
    [diarizedTranscription],
  );

  const clearTranscript = useCallback<
    SpeakerDiarizedTranscription['clearTranscript']
  >(() => {
    diarizedTranscription.clearTranscript();
  }, [diarizedTranscription]);

  return useMemo(
    () => ({ transcriptionItems, handleTranscriptionChunk, clearTranscript }),
    [transcriptionItems, handleTranscriptionChunk, clearTranscript],
  );
}

export type {
  SpeakerDiarizedTranscriptionItem,
  SpeakerDiarizedTranscriptionChunk,
};
