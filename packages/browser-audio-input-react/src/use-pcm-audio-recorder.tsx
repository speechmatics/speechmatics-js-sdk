import {
  type InputAudioEvent,
  PCMRecorder,
  type StartRecordingOptions,
} from '@speechmatics/browser-audio-input';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface IPCMAudioRecorderContext {
  startRecording: (
    opts: PartialBy<StartRecordingOptions, 'audioContext'>,
  ) => Promise<void>;
  stopRecording: PCMRecorder['stopRecording'];
  mute: PCMRecorder['mute'];
  unmute: PCMRecorder['unmute'];
  addEventListener: PCMRecorder['addEventListener'];
  removeEventListener: PCMRecorder['removeEventListener'];
  analyser: PCMRecorder['analyser'];
  isRecording: PCMRecorder['isRecording'];
  isMuted: PCMRecorder['isMuted'];
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
  audioContext,
}: {
  workletScriptURL: string;
  children: React.ReactNode;
  audioContext?: AudioContext;
}) {
  const recorder = useMemo(
    () => new PCMRecorder(workletScriptURL),
    [workletScriptURL],
  );

  useEffect(() => {
    return () => recorder.stopRecording();
  }, [recorder]);

  const startRecording = useCallback(
    (options: PartialBy<StartRecordingOptions, 'audioContext'>) => {
      const recorderAudioContext = options.audioContext ?? audioContext;
      if (!recorderAudioContext) {
        throw new Error(
          'AudioContext must be provided either in the argument to startRecording or as a prop to PCMAudioRecorderProvider',
        );
      }

      return recorder.startRecording({
        ...options,
        audioContext: recorderAudioContext,
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
