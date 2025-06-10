import type TranslatedSentence from './TranslatedSentence';
interface AddPartialTranslation {
  message: 'AddPartialTranslation';
  format?: string;
  language: string;
  results: TranslatedSentence[];
}
export default AddPartialTranslation;
