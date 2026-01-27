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
   */
  channel?: string;
}
export type { AddTranscript };
