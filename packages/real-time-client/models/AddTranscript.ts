import type { RecognitionMetadata } from './RecognitionMetadata';
import type { RecognitionResult } from './RecognitionResult';
interface AddTranscript {
  message: 'AddTranscript';
  /**
   * Speechmatics JSON output format version number.
   */
  format?: string;
  metadata: RecognitionMetadata;
  results: RecognitionResult[];
  /**
   * The channel identifier to which the audio belongs. This field is only seen in multichannel.
   *
   * :::note
   *
   * This field is only available in [preview mode](https://docs.speechmatics.com/private/preview-mode).
   *
   * :::
   */
  channel?: string;
}
export type { AddTranscript };
