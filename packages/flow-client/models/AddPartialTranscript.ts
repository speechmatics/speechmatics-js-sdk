import type { RecognitionMetadata } from './RecognitionMetadata';
import type { RecognitionResult } from './RecognitionResult';
interface AddPartialTranscript {
  message: 'AddPartialTranscript';
  format?: string;
  metadata: RecognitionMetadata;
  results: RecognitionResult[];
}
export type { AddPartialTranscript };
