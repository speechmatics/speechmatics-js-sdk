import {
  PCMRecorder,
  type StartRecordingOptions,
} from '@speechmatics/browser-audio-input';
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

type UsePCMAudioRecorderReturn = {
  startRecording: (
    options: Omit<StartRecordingOptions, 'audioContext'>,
  ) => Promise<void>;
  stopRecording: PCMRecorder['stopRecording'];
  mute: PCMRecorder['mute'];
  unmute: PCMRecorder['unmute'];
  isMuted: boolean;
  addEventListener: PCMRecorder['addEventListener'];
  removeEventListener: PCMRecorder['removeEventListener'];
  analyser: PCMRecorder['analyser'];
  isRecording: boolean;
};

export function usePCMAudioRecorder(
  workletScriptURL: string,
  audioContext: AudioContext | undefined,
): UsePCMAudioRecorderReturn {
  const recorder = useMemo(
    () => new PCMRecorder(workletScriptURL),
    [workletScriptURL],
  );

  useEffect(() => {
    return () => recorder.stopRecording();
  }, [recorder]);

  const startRecording = useCallback(
    (options: Omit<StartRecordingOptions, 'audioContext'>) => {
      if (!audioContext) {
        throw new Error('AudioContext not supplied!');
      }

      return recorder.startRecording({
        ...options,
        audioContext,
      });
    },
    [recorder, audioContext],
  );

  const stopRecording = useCallback<PCMRecorder['stopRecording']>(
    () => recorder.stopRecording(),
    [recorder],
  );

  const addEventListener = useCallback<PCMRecorder['addEventListener']>(
    (type, listener) => recorder.addEventListener(type, listener),
    [recorder],
  );

  const removeEventListener = useCallback<PCMRecorder['removeEventListener']>(
    (type, listener) => recorder.removeEventListener(type, listener),
    [recorder],
  );

  const analyser = useSyncExternalStore(
    (onChange: () => void) => {
      recorder.addEventListener('recordingStarted', onChange);
      recorder.addEventListener('recordingStopped', onChange);

      return () => {
        recorder.removeEventListener('recordingStarted', onChange);
        recorder.removeEventListener('recordingStopped', onChange);
      };
    },
    () => recorder.analyser,
    () => recorder.analyser,
  );

  const isRecording = useSyncExternalStore(
    (onChange: () => void) => {
      recorder.addEventListener('recordingStarted', onChange);
      recorder.addEventListener('recordingStopped', onChange);

      return () => {
        recorder.removeEventListener('recordingStarted', onChange);
        recorder.removeEventListener('recordingStopped', onChange);
      };
    },
    () => recorder.isRecording,
    () => recorder.isRecording,
  );

  const mute = useCallback<PCMRecorder['mute']>(
    () => recorder.mute(),
    [recorder],
  );

  const unmute = useCallback<PCMRecorder['unmute']>(
    () => recorder.unmute(),
    [recorder],
  );

  const isMuted = useSyncExternalStore(
    (onChange) => {
      recorder.addEventListener('mute', onChange);
      recorder.addEventListener('unmute', onChange);
      return () => {
        recorder.removeEventListener('mute', onChange);
        recorder.removeEventListener('unmute', onChange);
      };
    },
    () => recorder.isMuted,
    () => recorder.isMuted,
  );

  const value = useMemo(
    () => ({
      startRecording,
      stopRecording,
      mute,
      unmute,
      isMuted,
      addEventListener,
      removeEventListener,
      analyser,
      isRecording,
    }),
    [
      startRecording,
      stopRecording,
      mute,
      unmute,
      isMuted,
      addEventListener,
      removeEventListener,
      analyser,
      isRecording,
    ],
  );
  return value;
}
