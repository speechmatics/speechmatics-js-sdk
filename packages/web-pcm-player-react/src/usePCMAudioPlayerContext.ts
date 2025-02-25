'use client';
import { useContext } from 'react';
import { pcmPlayerContext } from './context';

export function usePCMAudioPlayerContext() {
  const value = useContext(pcmPlayerContext);
  if (!value) {
    throw new Error('Must call this hook in child of <PCMPlayerProvider>>');
  }
  return value;
}
