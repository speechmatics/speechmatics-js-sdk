/**
 * Contains configuration for [Audio Events](https://docs.speechmatics.com/speech-to-text/features/audio-events)
 */
interface AudioEventsConfig {
  /**
   * List of [Audio Event types](https://docs.speechmatics.com/speech-to-text/features/audio-events#supported-audio-events) to enable.
   */
  types?: string[];
}
export type { AudioEventsConfig };
