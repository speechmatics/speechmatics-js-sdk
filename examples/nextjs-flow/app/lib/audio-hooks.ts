import { useRef, useCallback, useEffect } from 'react';

export function usePlayPcm16Audio(audioContext: AudioContext | undefined) {
  const playbackStartTime = useRef(0);

  useEffect(() => {
    // Reset if audio context is cleared for some reason
    if (!audioContext) {
      playbackStartTime.current = 0;
    }
    // Otherwise reset on context close
    const onStateChange = () => {
      if (audioContext?.state === 'closed') {
        playbackStartTime.current = 0;
      }
    };
    audioContext?.addEventListener('statechange', onStateChange);
    return () =>
      audioContext?.removeEventListener('statechange', onStateChange);
  }, [audioContext]);

  return useCallback(
    (pcmData: Int16Array) => {
      if (!audioContext) {
        console.warn('Audio context not initialized for playback!');
        return;
      }
      if (audioContext.state === 'closed') {
        console.warn('Audio context closed');
        return;
      }

      const float32Array = pcm16ToFloat32(pcmData);
      const audioBuffer = audioContext.createBuffer(
        1,
        float32Array.length,
        audioContext.sampleRate,
      );
      audioBuffer.copyToChannel(float32Array, 0);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      const currentTime = audioContext.currentTime;
      if (playbackStartTime.current < currentTime) {
        playbackStartTime.current = currentTime;
      }

      source.connect(audioContext.destination);
      source.start(playbackStartTime.current);

      playbackStartTime.current += audioBuffer.duration;
    },
    [audioContext],
  );
}

const pcm16ToFloat32 = (pcm16: Int16Array) => {
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768; // Convert PCM16 to Float32
  }
  return float32;
};
