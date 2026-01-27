import type { RecognitionAlternative } from './RecognitionAlternative';
import type { SpokenFormRecognitionResultTypeEnum } from './SpokenFormRecognitionResultTypeEnum';
/**
 * A SpokenFormRecognitionResult describes a simple object which consists solely of 'word' or 'punctuation' type entries with a start and end time. It can occur only inside the spoken_form property of a full RecognitionResult
 */
interface SpokenFormRecognitionResult {
  alternatives: RecognitionAlternative[];
  end_time: number;
  start_time: number;
  type: SpokenFormRecognitionResultTypeEnum;
}
export type { SpokenFormRecognitionResult };
