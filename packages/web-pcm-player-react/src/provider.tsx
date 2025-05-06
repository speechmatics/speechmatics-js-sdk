'use client';
import { usePCMAudioPlayer } from './use-pcm-audio-player';
import { pcmPlayerContext } from './context';

export function PCMPlayerProvider({
  audioContext,
  children,
}: { audioContext?: AudioContext; children: React.ReactNode }) {
  const value = usePCMAudioPlayer(audioContext);
  return (
    <pcmPlayerContext.Provider value={{ ...value, audioContext }}>
      {children}
    </pcmPlayerContext.Provider>
  );
}
