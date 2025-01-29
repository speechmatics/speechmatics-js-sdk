import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { PCMPlayer } from '@speechmatics/web-pcm-player';

export function usePCMAudioPlayer(audioContext?: AudioContext) {
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

  return { playAudio, volumePercentage, setVolumePercentage };
}

export * from '@speechmatics/web-pcm-player';
