import type { MaxDelayModeConfig } from './MaxDelayModeConfig';
import type { AudioFilteringConfig } from './AudioFilteringConfig';
import type { ConversationConfig } from './ConversationConfig';
/**
 * Contains configuration for this recognition session.
 */
interface MidSessionTranscriptionConfig {
  /**
   * Language model to process the audio input, normally specified as an ISO language code. The value must be consistent with the language code used in the API endpoint URL.
   */
  language?: string;
  /**
   * This is the delay in seconds between the end of a spoken word and returning the Final transcript results. See [Latency](https://docs.speechmatics.com/speech-to-text/realtime/output#latency) for more details
   */
  max_delay?: number;
  /**
   * This allows some additional time for [Smart Formatting](https://docs.speechmatics.com/speech-to-text/formatting#smart-formatting).
   */
  max_delay_mode?: MaxDelayModeConfig;
  /**
   * Puts a lower limit on the volume of processed audio by using the `volume_threshold` setting. See [Audio Filtering](https://docs.speechmatics.com/speech-to-text/features/audio-filtering).
   */
  audio_filtering_config?: AudioFilteringConfig;
  /**
   * Whether or not to send Partials (i.e. `AddPartialTranslation` messages) as well as Finals (i.e. `AddTranslation` messages)
   * See [Partial transcripts](https://docs.speechmatics.com/speech-to-text/realtime/output#partial-transcripts).
   */
  enable_partials?: boolean;
  /**
   * This mode will detect when a speaker has stopped talking. The `end_of_utterance_silence_trigger` is the time in seconds after which the server will assume that the speaker has finished speaking, and will emit an `EndOfUtterance` message. A value of 0 disables the feature.
   */
  conversation_config?: ConversationConfig;
}
export type { MidSessionTranscriptionConfig };
