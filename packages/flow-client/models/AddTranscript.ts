import type { RecognitionMetadata } from './RecognitionMetadata';
import type { RecognitionResult } from './RecognitionResult';
interface AddTranscript {
  message: 'AddTranscript';
  format?: string;
  metadata: RecognitionMetadata;
  results: RecognitionResult[];
}
export type { AddTranscript };
