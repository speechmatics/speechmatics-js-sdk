'use client';
import { PCMPlayer } from '@speechmatics/web-pcm-player';
import { useMemo, useCallback, useSyncExternalStore } from 'react';

export function usePCMAudioPlayer(audioContext: AudioContext | undefined) {
  const player = useMemo(() => {
    if (!audioContext) {
      return null;
    }

    return new PCMPlayer(audioContext);
  }, [audioContext]);

  const playAudio = useCallback<PCMPlayer['playAudio']>(
    (data) => {
      if (!player) {
        console.warn('Player is not ready. AudioContext not provided');
        return;
      }
      return player.playAudio(data);
    },
    [player],
  );

  const volumePercentage = useSyncExternalStore(
    (onChange: () => void) => {
      player?.addEventListener('volumeChange', onChange);
      return () => player?.removeEventListener('volumeChange', onChange);
    },
    () => player?.volumePercentage,
    () => player?.volumePercentage,
  );

  const setVolumePercentage = useCallback(
    (percentage: number) => {
      if (player) {
        player.volumePercentage = percentage;
      }
    },
    [player],
  );

  const analyser = player?.analyser;

  return { playAudio, volumePercentage, setVolumePercentage, analyser };
}
