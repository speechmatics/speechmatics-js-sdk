import type { RecognitionAlternative } from './RecognitionAlternative';
import type { WrittenFormRecognitionResultTypeEnum } from './WrittenFormRecognitionResultTypeEnum';
/**
 * A WrittenFormRecognitionResult describes a simple object which consists solely of 'word' type entries with a start and end time. It can occur only inside the written_form property of a full RecognitionResult
 */
interface WrittenFormRecognitionResult {
  alternatives: RecognitionAlternative[];
  end_time: number;
  start_time: number;
  /**
   * What kind of object this is. See #/Definitions/RecognitionResult for definitions of the enums.
   */
  type: WrittenFormRecognitionResultTypeEnum;
}
export type { WrittenFormRecognitionResult };
