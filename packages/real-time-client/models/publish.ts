import type { StartRecognition } from './StartRecognition';
import type { EndOfStream } from './EndOfStream';
import type { SetRecognitionConfig } from './SetRecognitionConfig';
type publish = StartRecognition | string | EndOfStream | SetRecognitionConfig;
export type { publish };
