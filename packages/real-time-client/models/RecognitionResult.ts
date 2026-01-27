import type { RecognitionResultTypeEnum } from './RecognitionResultTypeEnum';
import type { AttachesToEnum } from './AttachesToEnum';
import type { RecognitionAlternative } from './RecognitionAlternative';
import type { SpokenFormRecognitionResult } from './SpokenFormRecognitionResult';
import type { WrittenFormRecognitionResult } from './WrittenFormRecognitionResult';
interface RecognitionResult {
  type: RecognitionResultTypeEnum;
  start_time: number;
  end_time: number;
  attaches_to?: AttachesToEnum;
  is_eos?: boolean;
  alternatives?: RecognitionAlternative[];
  volume?: number;
  /**
   * For 'entity' results only, the class the entity has been formatted as. Examples: 'date', 'money', 'number'
   */
  entity_class?: string;
  /**
   * For 'entity' results only, the spoken_form is the transcript of the individual words directly spoken.
   */
  spoken_form?: SpokenFormRecognitionResult[];
  /**
   * For 'entity' results only, the written_form is a standardized form of the spoken words. It contains the formatted entity split into individual words.
   */
  written_form?: WrittenFormRecognitionResult[];
}
export type { RecognitionResult };
