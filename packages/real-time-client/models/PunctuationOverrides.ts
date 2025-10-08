/**
 * Options for controlling punctuation in the output transcripts. See [Punctuation Settings](https://docs.speechmatics.com/speech-to-text/formatting#punctuation)
 */
interface PunctuationOverrides {
  /**
   * The punctuation marks which the client is prepared to accept in transcription output, or the special value 'all' (the default). Unsupported marks are ignored. This value is used to guide the transcription process.
   */
  permitted_marks?: string[];
  /**
   * Ranges between zero and one. Higher values will produce more punctuation. The default is 0.5.
   */
  sensitivity?: number;
}
export type { PunctuationOverrides };
