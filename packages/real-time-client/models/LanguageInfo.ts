import type { WritingDirectionEnum } from './WritingDirectionEnum';
interface LanguageInfo {
  message: 'LanguageInfo';
  /**
   * The detected language code.
   */
  language: string;
  /**
   * The delimiter to place between words of this language when reconstructing the transcript.
   */
  word_delimiter: string;
  /**
   * The direction that words in the language should be written and read in.
   */
  writing_direction: WritingDirectionEnum;
  /**
   * Whether the message was triggered by a Partial transcript. This field is only seen when its value is `true`.
   */
  partial?: boolean;
}
export type { LanguageInfo };
