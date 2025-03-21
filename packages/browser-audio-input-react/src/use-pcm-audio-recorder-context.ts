import { useContext, useEffect } from 'react';
import { context } from './recorder-context';
import type { InputAudioEvent } from '@speechmatics/browser-audio-input';

export function usePCMAudioRecorderContext() {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error('PCM audio recorder context must be provided');
  }

  return ctx;
}

export function usePCMAudioListener(cb: (audio: Float32Array) => void) {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error('PCM audio recorder context must be provided');
  }

  const { addEventListener, removeEventListener } = ctx;

  useEffect(() => {
    const onAudio = (ev: InputAudioEvent) => {
      cb(ev.data);
    };

    addEventListener('audio', onAudio);

    return () => {
      removeEventListener('audio', onAudio);
    };
  }, [addEventListener, removeEventListener, cb]);
}
