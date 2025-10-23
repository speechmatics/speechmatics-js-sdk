interface AudioEventEndData {
  /**
   * The type of audio event that has started or ended. See our list of [supported Audio Event types](https://docs.speechmatics.com/speech-to-text/features/audio-events#supported-audio-events).
   */
  type: string;
  end_time: number;
}
export type { AudioEventEndData };
