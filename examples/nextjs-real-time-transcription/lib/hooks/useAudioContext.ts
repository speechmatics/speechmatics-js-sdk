import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { RECORDING_SAMPLE_RATE } from '../constants';

export function useAudioContext() {
  const hydrated = useHydrated();
  const audioContext = useMemo(
    () =>
      hydrated
        ? new window.AudioContext({ sampleRate: RECORDING_SAMPLE_RATE })
        : undefined,
    [hydrated],
  );

  useCleanupAudioContext(audioContext);

  return audioContext;
}

// Lets us know if we're rendering client side or not
const useHydrated = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

// Close audio context when component unmounts
function useCleanupAudioContext(context?: AudioContext) {
  useEffect(() => {
    return () => {
      if (context && context.state !== 'closed') {
        context.close();
      }
    };
  }, [context]);
}
