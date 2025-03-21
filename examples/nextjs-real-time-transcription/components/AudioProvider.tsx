'use client';

import { useAudioContext } from '@/lib/hooks/useAudioContext';
import { PCMAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';
import type { PropsWithChildren } from 'react';

export function AudioProvider({ children }: PropsWithChildren) {
  const audioContext = useAudioContext();

  return (
    <PCMAudioRecorderProvider
      audioContext={audioContext}
      workletScriptURL="/js/pcm-audio-worklet.min.js"
    >
      {children}
    </PCMAudioRecorderProvider>
  );
}
