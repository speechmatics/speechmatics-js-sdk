interface RecognitionMetadata {
  start_time: number;
  end_time: number;
  /**
   * The entire transcript contained in the segment in text format. Providing the entire transcript here is designed for ease of consumption; we have taken care of all the necessary formatting required to concatenate the transcription results into a block of text.
   * This transcript lacks the detailed information however which is contained in the `results` field of the message - such as the timings and confidences for each word.
   */
  transcript: string;
}
export type { RecognitionMetadata };
