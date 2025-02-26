'use client';
import { createContext } from 'react';
import type { usePCMAudioPlayer } from '.';

export const pcmPlayerContext = createContext<
  | (ReturnType<typeof usePCMAudioPlayer> & { audioContext?: AudioContext })
  | null
>(null);
