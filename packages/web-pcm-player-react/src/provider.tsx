'use client';
import React, { type ReactNode } from 'react';
import { usePCMAudioPlayer } from './usePCMAudioPlayer';
import { pcmPlayerContext } from './context';

export function PCMPlayerProvider({
  audioContext,
  children,
}: { audioContext: AudioContext; children: ReactNode }) {
  const value = usePCMAudioPlayer(audioContext);
  <pcmPlayerContext.Provider value={value}>
    {children}
  </pcmPlayerContext.Provider>;
}
