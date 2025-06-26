import type { WarningTypeEnum } from './WarningTypeEnum';
interface ConversationTermination {
  message: 'Warning';
  type: WarningTypeEnum;
  reason: string;
  conversation_termination: number;
}
export type { ConversationTermination };
