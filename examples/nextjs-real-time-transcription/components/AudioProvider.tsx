'use client';

import { useAudioContext } from '@/lib/hooks/useAudioContext';
import { PCMAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';
import type { PropsWithChildren } from 'react';
// The worklet is loaded as an asset URL, configured via `turbopack.rules` in
// next.config.ts (Turbopack emits the file and this import resolves to its URL).
import workletScriptURL from '@speechmatics/browser-audio-input/pcm-audio-worklet.min.js';

export function AudioProvider({ children }: PropsWithChildren) {
  const audioContext = useAudioContext();

  return (
    <PCMAudioRecorderProvider
      audioContext={audioContext}
      workletScriptURL={workletScriptURL}
    >
      {children}
    </PCMAudioRecorderProvider>
  );
}
