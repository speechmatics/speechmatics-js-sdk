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
}
export type { AddTranscript };
