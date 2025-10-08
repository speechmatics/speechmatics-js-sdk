interface AudioEventStartData {
  /**
   * The type of audio event that has started or ended. See our list of [supported Audio Event types](https://docs.speechmatics.com/speech-to-text/features/audio-events#supported-audio-events).
   */
  type: string;
  /**
   * The time (in seconds) of the audio corresponding to the beginning of the audio event.
   */
  start_time: number;
  /**
   * A confidence score assigned to the audio event. Ranges from 0.0 (least confident) to 1.0 (most confident).
   */
  confidence: number;
}
export type { AudioEventStartData };
