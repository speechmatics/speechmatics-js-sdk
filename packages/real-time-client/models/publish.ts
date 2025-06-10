import type { StartRecognition } from './StartRecognition';
import type { AddChannelAudio } from './AddChannelAudio';
import type { EndOfStream } from './EndOfStream';
import type { EndOfChannel } from './EndOfChannel';
import type { SetRecognitionConfig } from './SetRecognitionConfig';
type publish =
  | StartRecognition
  | string
  | AddChannelAudio
  | EndOfStream
  | EndOfChannel
  | SetRecognitionConfig;
export type { publish };
