import {
  AddPartialTranscript,
  AddTranscript,
  RecognitionStarted,
  AddPartialTranslation,
  AddTranslation,
  ModelError,
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
}
