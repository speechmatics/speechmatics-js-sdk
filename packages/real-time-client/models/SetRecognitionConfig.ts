import type { MidSessionTranscriptionConfig } from './MidSessionTranscriptionConfig';
interface SetRecognitionConfig {
  message: 'SetRecognitionConfig';
  /**
   * Contains configuration for this recognition session.
   */
  transcription_config: MidSessionTranscriptionConfig;
}
export type { SetRecognitionConfig };
