import type { StartRecognition } from './StartRecognition';
import type { EndOfStream } from './EndOfStream';
import type { SetRecognitionConfig } from './SetRecognitionConfig';
type RealtimeClientMessage =
  | StartRecognition
  | EndOfStream
  | SetRecognitionConfig;
export type { RealtimeClientMessage };
