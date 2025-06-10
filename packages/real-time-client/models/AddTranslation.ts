import type TranslatedSentence from './TranslatedSentence';
interface AddTranslation {
  message: 'AddTranslation';
  format?: string;
  language: string;
  results: TranslatedSentence[];
}
export default AddTranslation;
