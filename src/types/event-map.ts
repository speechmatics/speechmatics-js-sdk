import {
  AddPartialTranscript,
  AddTranscript,
  RecognitionStarted,
  AddPartialTranslation,
  AddTranslation,
  ModelError,
  AudioEventStarted,
  AudioEventEnded,
} from './models';

export interface EventMap {
  RecognitionStarted: (result: RecognitionStarted) => void;
  EndOfStream: () => void;
  AddPartialTranscript: (result: AddPartialTranscript) => void;
  AddTranscript: (result: AddTranscript) => void;
  AddPartialTranslation: (result: AddPartialTranslation) => void;
  AddTranslation: (result: AddTranslation) => void;
  EndOfTranscript: () => void;
  Info: (message: string) => void;
  Warning: (message: string) => void;
  Error: (message: ModelError) => void;
  AudioAdded: () => void;
  AudioEventStarted: (result: AudioEventStarted) => void;
  AudioEventEnded: (result: AudioEventEnded) => void;
}
