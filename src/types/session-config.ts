import {
  RealtimeTranscriptionConfig,
  RealtimeTranslationConfig,
  AudioFormat,
} from './models';

/**
 * The SessionConfig type for configuring realtime sessions.
 */
export type SessionConfig = {
  transcription_config?: RealtimeTranscriptionConfig;
  translation_config?: RealtimeTranslationConfig;
  audio_format?: AudioFormat;
};
