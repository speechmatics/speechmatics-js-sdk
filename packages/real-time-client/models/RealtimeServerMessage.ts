import type { RecognitionStarted } from './RecognitionStarted';
import type { AudioAdded } from './AudioAdded';
import type { AddPartialTranscript } from './AddPartialTranscript';
import type { AddTranscript } from './AddTranscript';
import type { AddPartialTranslation } from './AddPartialTranslation';
import type { AddTranslation } from './AddTranslation';
import type { EndOfTranscript } from './EndOfTranscript';
import type { AudioEventStarted } from './AudioEventStarted';
import type { AudioEventEnded } from './AudioEventEnded';
import type { EndOfUtterance } from './EndOfUtterance';
import type { Info } from './Info';
import type { Warning } from './Warning';
import type { ErrorType } from './ErrorType';
type RealtimeServerMessage =
  | RecognitionStarted
  | AudioAdded
  | AddPartialTranscript
  | AddTranscript
  | AddPartialTranslation
  | AddTranslation
  | EndOfTranscript
  | AudioEventStarted
  | AudioEventEnded
  | EndOfUtterance
  | Info
  | Warning
  | ErrorType;
export type { RealtimeServerMessage };
