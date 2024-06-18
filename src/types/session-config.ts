import {
  RealtimeTranscriptionConfig,
  RealtimeTranslationConfig,
  AudioFormat,
  RealtimeAudioEventsConfig,
} from './models';

/**
 * The SessionConfig type for configuring realtime sessions.
 */
export type SessionConfig = {
  transcription_config?: RealtimeTranscriptionConfig;
  translation_config?: RealtimeTranslationConfig;
  audio_events_config?: RealtimeAudioEventsConfig;
  audio_format?: AudioFormat;
};
