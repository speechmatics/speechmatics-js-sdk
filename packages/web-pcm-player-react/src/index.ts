import { useCallback, useMemo } from 'react';
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

  return { playAudio };
}

export * from '@speechmatics/web-pcm-player';
