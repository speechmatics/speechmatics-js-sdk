'use client';

import { RECORDING_SAMPLE_RATE } from '@/lib/constants';
import { PCMAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';
import { PCMPlayerProvider } from '@speechmatics/web-pcm-player-react';
import {
  type PropsWithChildren,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

export function AudioProvider({ children }: PropsWithChildren) {
  // Get audio contexts for input and playback
  // (see note above `useAudioContexts` for more info)
  const { inputAudioContext, playbackAudioContext } = useAudioContexts();

  return (
    // Two context providers
    // 1. For the audio recorder (see https://github.com/speechmatics/speechmatics-js-sdk/blob/main/packages/browser-audio-input-react/README.md)
    // 2. For the audio player (see https://github.com/speechmatics/speechmatics-js-sdk/blob/main/packages/web-pcm-player-react/README.md)
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
    return isFirefox ? new window.AudioContext() : inputAudioContext;
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
      if (context && context.state !== 'closed') {
        context.close();
      }
    };
  }, [context]);
}
