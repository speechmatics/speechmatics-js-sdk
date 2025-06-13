import type { AdditionalVocabObject } from './AdditionalVocabObject';
import type { DiarizationConfig } from './DiarizationConfig';
import type { MaxDelayModeConfig } from './MaxDelayModeConfig';
import type { SpeakerDiarizationConfig } from './SpeakerDiarizationConfig';
import type { AudioFilteringConfig } from './AudioFilteringConfig';
import type { TranscriptFilteringConfig } from './TranscriptFilteringConfig';
import type { OperatingPoint } from './OperatingPoint';
import type { PunctuationOverrides } from './PunctuationOverrides';
import type { ConversationConfig } from './ConversationConfig';
interface TranscriptionConfig {
  language: string;
  /**
   * Request a specialized model based on 'language' but optimized for a particular field, e.g. "finance" or "medical".
   */
  domain?: string;
  output_locale?: string;
  additional_vocab?: (string | AdditionalVocabObject)[];
  diarization?: DiarizationConfig;
  max_delay?: number;
  max_delay_mode?: MaxDelayModeConfig;
  speaker_diarization_config?: SpeakerDiarizationConfig;
  audio_filtering_config?: AudioFilteringConfig;
  transcript_filtering_config?: TranscriptFilteringConfig;
  enable_partials?: boolean;
  enable_entities?: boolean;
  operating_point?: OperatingPoint;
  punctuation_overrides?: PunctuationOverrides;
  /**
   * This mode will detect when a speaker has stopped talking. The end_of_utterance_silence_trigger is the time in seconds after which the server will assume that the speaker has finished speaking, and will emit an EndOfUtterance message. A value of 0 disables the feature.
   */
  conversation_config?: ConversationConfig;
}
export type { TranscriptionConfig };
