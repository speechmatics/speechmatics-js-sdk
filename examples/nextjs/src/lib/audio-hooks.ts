import { useRef, useState, useCallback, useEffect } from 'react';

/**
 *
 * Hook for getting PCM (f32) microphone audio in the browser.
 *
 * The Web Audio APIs tend to use f32 over int16, when capturing/playing audio.
 * The Flow service accepts both, so we use f32 here to avoid converting.
 */
export function usePcmMicrophoneAudio(onAudio: (audio: Float32Array) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaStreamRef = useRef<MediaStream>();

  const startRecording = useCallback(
    async (audioContext: AudioContext) => {
      // If stream is present, it means we're already recording, nothing to do
      if (mediaStreamRef.current) {
        return mediaStreamRef.current;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: audioContext?.sampleRate,
          sampleSize: 16,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setIsRecording(true);

      // TODO see if we can do this without script processor
      const input = audioContext.createMediaStreamSource(mediaStream);
      const processor = audioContext.createScriptProcessor(512, 1, 1);

      input.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0);
        onAudio(inputBuffer);
      };

      mediaStreamRef.current = mediaStream;
      return mediaStream;
    },
    [onAudio],
  );

  const stopRecording = useCallback(() => {
    for (const track of mediaStreamRef.current?.getTracks() ?? []) {
      track.stop();
    }
    mediaStreamRef.current = undefined;

    setIsRecording(false);
  }, []);

  return { startRecording, stopRecording, isRecording };
}

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
