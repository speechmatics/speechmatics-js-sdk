import type { WritingDirectionEnum } from './WritingDirectionEnum';
/**
 * Properties of the language pack.
 */
interface LanguagePackInfo {
  /**
   * Full descriptive name of the language, e.g. 'Japanese'.
   */
  language_description?: string;
  /**
   * The character to use to separate words.
   */
  word_delimiter: string;
  /**
   * The direction that words in the language should be written and read in.
   */
  writing_direction?: WritingDirectionEnum;
  /**
   * Whether or not ITN (inverse text normalization) is available for the language pack.
   */
  itn?: boolean;
  /**
   * Whether or not language model adaptation has been applied to the language pack.
   */
  adapted?: boolean;
}
export type { LanguagePackInfo };
