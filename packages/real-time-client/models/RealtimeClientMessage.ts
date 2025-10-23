import type { StartRecognition } from './StartRecognition';
import type { AddChannelAudio } from './AddChannelAudio';
import type { EndOfStream } from './EndOfStream';
import type { EndOfChannel } from './EndOfChannel';
import type { SetRecognitionConfig } from './SetRecognitionConfig';
import type { GetSpeakers } from './GetSpeakers';
type RealtimeClientMessage =
  | StartRecognition
  | AddChannelAudio
  | EndOfStream
  | EndOfChannel
  | SetRecognitionConfig
  | GetSpeakers;
export type { RealtimeClientMessage };
