import {
  type InputAudioEvent,
  PCMRecorder,
} from '@speechmatics/browser-audio-input';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

export interface IPCMAudioRecorderContext {
  startRecording: PCMRecorder['startRecording'];
  stopRecording: PCMRecorder['stopRecording'];
  addEventListener: PCMRecorder['addEventListener'];
  removeEventListener: PCMRecorder['removeEventListener'];
  analyser: PCMRecorder['analyser'];
  isRecording: PCMRecorder['isRecording'];
}

const context = createContext<IPCMAudioRecorderContext | null>(null);

export function usePCMAudioRecorder() {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error('PCM audio recorder context must be provided');
  }

  return ctx;
}

export function PCMAudioRecorderProvider({
  workletScriptURL,
  children,
}: {
  workletScriptURL: string;
  children: React.ReactNode;
}) {
  const recorder = useMemo(
    () => new PCMRecorder(workletScriptURL),
    [workletScriptURL],
  );

  useEffect(() => {
    return () => recorder.stopRecording();
  }, [recorder]);

  const startRecording = useCallback<PCMRecorder['startRecording']>(
    (options) => recorder.startRecording(options),
    [recorder],
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

  const value = useMemo(
    () => ({
      startRecording,
      stopRecording,
      addEventListener,
      removeEventListener,
      analyser,
      isRecording,
    }),
    [
      startRecording,
      stopRecording,
      addEventListener,
      removeEventListener,
      analyser,
      isRecording,
    ],
  );

  return <context.Provider value={value}>{children}</context.Provider>;
}

export function usePCMAudioListener(cb: (audio: Float32Array) => void) {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error('PCM audio recorder context must be provided');
  }

  const { addEventListener, removeEventListener } = ctx;

  useEffect(() => {
    const onAudio = (ev: InputAudioEvent) => {
      cb(ev.data);
    };

    addEventListener('audio', onAudio);

    return () => {
      removeEventListener('audio', onAudio);
    };
  }, [addEventListener, removeEventListener, cb]);
}
