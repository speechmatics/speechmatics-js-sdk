import type { LanguagePackInfo } from './LanguagePackInfo';
interface RecognitionStarted {
  message: 'RecognitionStarted';
  orchestrator_version?: string;
  id?: string;
  /**
   * Properties of the language pack.
   */
  language_pack_info?: LanguagePackInfo;
}
export type { RecognitionStarted };
