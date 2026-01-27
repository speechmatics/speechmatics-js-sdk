import type { AdditionalVocabObject } from './AdditionalVocabObject';
import type { DiarizationConfig } from './DiarizationConfig';
import type { MaxDelayModeConfig } from './MaxDelayModeConfig';
import type { SpeakerDiarizationConfig } from './SpeakerDiarizationConfig';
import type { AudioFilteringConfig } from './AudioFilteringConfig';
import type { TranscriptFilteringConfig } from './TranscriptFilteringConfig';
import type { OperatingPoint } from './OperatingPoint';
import type { PunctuationOverrides } from './PunctuationOverrides';
import type { ConversationConfig } from './ConversationConfig';
/**
 * Contains configuration for this recognition session.
 */
interface TranscriptionConfig {
  /**
   * Language model to process the audio input, normally specified as an ISO language code. The value must be consistent with the language code used in the API endpoint URL.
   */
  language: string;
  /**
   * Request a specialized model based on 'language' but optimized for a particular field, e.g. `finance` or `medical`.
   */
  domain?: string;
  /**
   * Configure locale for outputted transcription. See [output formatting](https://docs.speechmatics.com/speech-to-text/formatting#output-locale).
   */
  output_locale?: string;
  /**
   * Configure [custom dictionary](https://docs.speechmatics.com/speech-to-text/features/custom-dictionary). Default is an empty list. You should be aware that there is a performance penalty (latency degradation and memory increase) from using `additional_vocab`, especially if you use a large word list. When initializing a session that uses `additional_vocab` in the config, you should expect a delay of up to 15 seconds (depending on the size of the list).
   */
  additional_vocab?: (string | AdditionalVocabObject)[];
  /**
   * Set to `speaker` to apply [Speaker Diarization](https://docs.speechmatics.com/speech-to-text/features/diarization) to the audio.
   */
  diarization?: DiarizationConfig;
  /**
   * This is the delay in seconds between the end of a spoken word and returning the Final transcript results. See [Latency](https://docs.speechmatics.com/speech-to-text/realtime/output#latency) for more details
   */
  max_delay?: number;
  /**
   * This allows some additional time for [Smart Formatting](https://docs.speechmatics.com/speech-to-text/formatting#smart-formatting).
   */
  max_delay_mode?: MaxDelayModeConfig;
  speaker_diarization_config?: SpeakerDiarizationConfig;
  /**
   * Puts a lower limit on the volume of processed audio by using the `volume_threshold` setting. See [Audio Filtering](https://docs.speechmatics.com/speech-to-text/features/audio-filtering).
   */
  audio_filtering_config?: AudioFilteringConfig;
  transcript_filtering_config?: TranscriptFilteringConfig;
  /**
   * Whether or not to send Partials (i.e. `AddPartialTranslation` messages) as well as Finals (i.e. `AddTranslation` messages)
   * See [Partial transcripts](https://docs.speechmatics.com/speech-to-text/realtime/output#partial-transcripts).
   */
  enable_partials?: boolean;
  enable_entities?: boolean;
  /**
   * Which model you wish to use. See [Operating points](http://docs.speechmatics.com/speech-to-text/#operating-points) for more details.
   */
  operating_point?: OperatingPoint;
  /**
   * Options for controlling punctuation in the output transcripts. See [Punctuation Settings](https://docs.speechmatics.com/speech-to-text/formatting#punctuation)
   */
  punctuation_overrides?: PunctuationOverrides;
  /**
   * This mode will detect when a speaker has stopped talking. The `end_of_utterance_silence_trigger` is the time in seconds after which the server will assume that the speaker has finished speaking, and will emit an `EndOfUtterance` message. A value of 0 disables the feature.
   */
  conversation_config?: ConversationConfig;
  channel_diarization_labels?: string[];
}
export type { TranscriptionConfig };
