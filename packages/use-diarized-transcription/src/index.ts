import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { SpeakerDiarizedTranscription } from '@speechmatics/diarized-transcription';

export function useSpeakerDiarizedTranscription() {
  const [diarizedTranscription] = useState(
    () => new SpeakerDiarizedTranscription(),
  );

  const messages = useSyncExternalStore(
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

  return useMemo(
    () => ({ messages, handleTranscriptionChunk }),
    [messages, handleTranscriptionChunk],
  );
}
