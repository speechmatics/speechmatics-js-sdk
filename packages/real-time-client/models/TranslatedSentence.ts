interface TranslatedSentence {
  content: string;
  /**
   * The start time (in seconds) of the original transcribed audio segment
   */
  start_time: number;
  /**
   * The end time (in seconds) of the original transcribed audio segment
   */
  end_time: number;
  /**
   * The speaker that uttered the speech if speaker diarization is enabled
   */
  speaker?: string;
}
export type { TranslatedSentence };
