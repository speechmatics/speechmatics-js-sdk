import type { TranslatedSentence } from './TranslatedSentence';
interface AddPartialTranslation {
  message: 'AddPartialTranslation';
  /**
   * Speechmatics JSON output format version number.
   */
  format?: string;
  language: string;
  results: TranslatedSentence[];
}
export type { AddPartialTranslation };
