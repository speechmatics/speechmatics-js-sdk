'use client';

import { PCMAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';
import { PCMPlayerProvider } from '@speechmatics/web-pcm-player-react';
import { useEffect, useMemo, useSyncExternalStore } from 'react';

type SpeechmaticsProviderProps = {
  children: React.ReactNode;
};

export const RECORDING_SAMPLE_RATE =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox')
    ? undefined
    : 16_000;

export function AudioProvider({ children }: SpeechmaticsProviderProps) {
  const { inputAudioContext, playbackAudioContext } = useAudioContexts();

  return (
    <PCMAudioRecorderProvider
      audioContext={inputAudioContext}
      workletScriptURL="/js/pcm-audio-worklet.min.js"
    >
      <PCMPlayerProvider audioContext={playbackAudioContext}>
        {children}
      </PCMPlayerProvider>
    </PCMAudioRecorderProvider>
  );
}

// This hook returns audio contexts for recording and playback.
// In practice they will be the same AudioContext, except in Firefox where sample rates may differ
// See bug tracked here: https://bugzilla.mozilla.org/show_bug.cgi?id=1725336https://bugzilla.mozilla.org/show_bug.cgi?id=1725336
// TODO: If/when the bug is fixed, we can use the same audio context for both recording and playback
function useAudioContexts() {
  const hydrated = useHydrated();
  const inputAudioContext = useMemo(
    () =>
      hydrated
        ? new window.AudioContext({ sampleRate: RECORDING_SAMPLE_RATE })
        : undefined,
    [hydrated],
  );

  const playbackAudioContext = useMemo(() => {
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    return isFirefox
      ? new window.AudioContext({ sampleRate: RECORDING_SAMPLE_RATE })
      : inputAudioContext;
  }, [inputAudioContext]);

  useCleanupAudioContext(inputAudioContext);
  useCleanupAudioContext(playbackAudioContext);

  return { inputAudioContext, playbackAudioContext };
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
      if (context && context.state === 'running') {
        context.close();
      }
    };
  }, [context]);
}
