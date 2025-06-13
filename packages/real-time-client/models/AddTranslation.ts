import type { TranslatedSentence } from './TranslatedSentence';
interface AddTranslation {
  message: 'AddTranslation';
  /**
   * Speechmatics JSON output format version number.
   */
  format?: string;
  language: string;
  results: TranslatedSentence[];
}
export type { AddTranslation };
