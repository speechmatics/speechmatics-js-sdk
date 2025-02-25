'use client';
import { usePCMAudioPlayer } from './usePCMAudioPlayer';
import { pcmPlayerContext } from './context';

export function PCMPlayerProvider({
  audioContext,
  children,
}: { audioContext?: AudioContext; children: React.ReactNode }) {
  const value = usePCMAudioPlayer(audioContext);
  return (
    <pcmPlayerContext.Provider value={value}>
      {children}
    </pcmPlayerContext.Provider>
  );
}
