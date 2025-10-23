import type { TranslatedSentence } from './TranslatedSentence';
interface AddTranslation {
  message: 'AddTranslation';
  /**
   * Speechmatics JSON output format version number.
   */
  format?: string;
  /**
   * Language translation relates to given as an ISO language code.
   */
  language: string;
  results: TranslatedSentence[];
}
export type { AddTranslation };
