import type { DirectionEnum } from './DirectionEnum';
/**
 * Information about how the word/symbol should be displayed.
 */
interface RecognitionDisplay {
  /**
   * Either `ltr` for words that should be displayed left-to-right, or `rtl` vice versa.
   */
  direction: DirectionEnum;
}
export type { RecognitionDisplay };
