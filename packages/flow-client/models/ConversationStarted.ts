import type { LanguagePackInfo } from './LanguagePackInfo';
interface ConversationStarted {
  message: 'ConversationStarted';
  id?: string;
  asr_session_id?: string;
  language_pack_info?: LanguagePackInfo;
}
export type { ConversationStarted };
