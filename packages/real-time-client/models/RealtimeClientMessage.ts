import type { StartRecognition } from './StartRecognition';
import type { AddChannelAudio } from './AddChannelAudio';
import type { EndOfStream } from './EndOfStream';
import type { EndOfChannel } from './EndOfChannel';
import type { ForceEndOfUtterance } from './ForceEndOfUtterance';
import type { SetRecognitionConfig } from './SetRecognitionConfig';
import type { GetSpeakers } from './GetSpeakers';
type RealtimeClientMessage =
  | StartRecognition
  | AddChannelAudio
  | EndOfStream
  | EndOfChannel
  | ForceEndOfUtterance
  | SetRecognitionConfig
  | GetSpeakers;
export type { RealtimeClientMessage };
