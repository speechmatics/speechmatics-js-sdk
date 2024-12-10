import {
  type InputAudioEvent,
  PcmRecorder,
} from '@speechmatics/browser-audio-input';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

export interface IPcmAudioRecorderContext {
  startRecording: PcmRecorder['startRecording'];
  stopRecording: PcmRecorder['stopRecording'];
  addEventListener: PcmRecorder['addEventListener'];
  removeEventListener: PcmRecorder['removeEventListener'];
  mediaStream: PcmRecorder['mediaStream'];
  isRecording: PcmRecorder['isRecording'];
}

const context = createContext<IPcmAudioRecorderContext | null>(null);

export function usePcmAudioRecorder() {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error('Pcm audio recorder context must be provided');
  }

  return ctx;
}

export function PcmAudioRecorderProvider({
  workletScriptURL,
  children,
}: {
  workletScriptURL: string;
  children: React.ReactNode;
}) {
  const [pcmRecorder] = useState(() => new PcmRecorder(workletScriptURL));

  const startRecording = useCallback<PcmRecorder['startRecording']>(
    (options) => pcmRecorder.startRecording(options),
    [pcmRecorder],
  );

  const stopRecording = useCallback<PcmRecorder['stopRecording']>(
    () => pcmRecorder.stopRecording(),
    [pcmRecorder],
  );

  const addEventListener = useCallback<
    (typeof pcmRecorder)['addEventListener']
  >(
    (type, listener) => pcmRecorder.addEventListener(type, listener),
    [pcmRecorder],
  );

  const removeEventListener = useCallback<
    (typeof pcmRecorder)['removeEventListener']
  >(
    (type, listener) => pcmRecorder.removeEventListener(type, listener),
    [pcmRecorder],
  );

  const mediaStream = useSyncExternalStore(
    (onChange: () => void) => {
      pcmRecorder.addEventListener('recordingStarted', onChange);
      pcmRecorder.addEventListener('recordingStopped', onChange);

      return () => {
        pcmRecorder.removeEventListener('recordingStarted', onChange);
        pcmRecorder.removeEventListener('recordingStopped', onChange);
      };
    },
    () => pcmRecorder.mediaStream,
    () => pcmRecorder.mediaStream,
  );

  const isRecording = useSyncExternalStore(
    (onChange: () => void) => {
      pcmRecorder.addEventListener('recordingStarted', onChange);
      pcmRecorder.addEventListener('recordingStopped', onChange);

      return () => {
        pcmRecorder.removeEventListener('recordingStarted', onChange);
        pcmRecorder.removeEventListener('recordingStopped', onChange);
      };
    },
    () => pcmRecorder.isRecording,
    () => pcmRecorder.isRecording,
  );

  const value = useMemo(
    () => ({
      startRecording,
      stopRecording,
      addEventListener,
      removeEventListener,
      mediaStream,
      isRecording,
    }),
    [
      startRecording,
      stopRecording,
      addEventListener,
      removeEventListener,
      mediaStream,
      isRecording,
    ],
  );

  return <context.Provider value={value}>{children}</context.Provider>;
}

export function usePcmAudioListener(cb: (audio: Float32Array) => void) {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error('Pcm audio recorder context must be provided');
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
