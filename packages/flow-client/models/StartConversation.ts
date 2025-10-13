import type { AudioFormat } from './AudioFormat';
import type { ConversationConfig } from './ConversationConfig';
import type { ToolConfig } from './ToolConfig';
import type { DebugObject } from './DebugObject';
interface StartConversation {
  message: 'StartConversation';
  audio_format?: AudioFormat;
  conversation_config: ConversationConfig;
  tools?: ToolConfig[];
  debug?: DebugObject;
}
export type { StartConversation };
