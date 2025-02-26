import type {
  PCMRecorder,
  StartRecordingOptions,
} from '@speechmatics/browser-audio-input';
import { createContext } from 'react';

export interface IPCMAudioRecorderContext {
  startRecording: (
    opts: Omit<StartRecordingOptions, 'audioContext'>,
  ) => Promise<void>;
  stopRecording: PCMRecorder['stopRecording'];
  mute: PCMRecorder['mute'];
  unmute: PCMRecorder['unmute'];
  addEventListener: PCMRecorder['addEventListener'];
  removeEventListener: PCMRecorder['removeEventListener'];
  analyser: PCMRecorder['analyser'];
  isRecording: PCMRecorder['isRecording'];
  isMuted: PCMRecorder['isMuted'];
  audioContext?: AudioContext;
}

export const context = createContext<IPCMAudioRecorderContext | null>(null);
