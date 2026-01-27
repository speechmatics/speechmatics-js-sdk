import type { Raw } from './Raw';
import type { FileType } from './FileType';
import type { TranscriptionConfig } from './TranscriptionConfig';
import type { TranslationConfig } from './TranslationConfig';
import type { AudioEventsConfig } from './AudioEventsConfig';
interface StartRecognition {
  message: 'StartRecognition';
  audio_format: Raw | FileType;
  /**
   * Contains configuration for this recognition session.
   */
  transcription_config: TranscriptionConfig;
  /**
   * Specifies various configuration values for translation. All fields except `target_languages` are optional, using default values when omitted.
   */
  translation_config?: TranslationConfig;
  /**
   * Contains configuration for [Audio Events](https://docs.speechmatics.com/speech-to-text/features/audio-events)
   */
  audio_events_config?: AudioEventsConfig;
}
export type { StartRecognition };
