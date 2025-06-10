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
  conversation_config?: ConversationConfig;
}
export type { TranscriptionConfig };
