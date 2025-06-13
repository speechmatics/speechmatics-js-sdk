import type { AudioFormatRaw } from './AudioFormatRaw';
import type { AudioFormatFile } from './AudioFormatFile';
import type { ConversationConfig } from './ConversationConfig';
import type { ToolConfig } from './ToolConfig';
import type { DebugObject } from './DebugObject';
interface StartConversation {
  message: 'StartConversation';
  audio_format: AudioFormatRaw | AudioFormatFile;
  conversation_config: ConversationConfig;
  tools?: ToolConfig[];
  debug?: DebugObject;
}
export type { StartConversation };
