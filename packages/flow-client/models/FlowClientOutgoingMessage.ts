import type { StartConversation } from './StartConversation';
import type { AudioReceived } from './AudioReceived';
import type { AudioEnded } from './AudioEnded';
import type { AddInput } from './AddInput';
import type { ToolResult } from './ToolResult';
type FlowClientOutgoingMessage =
  | StartConversation
  | AudioReceived
  | AudioEnded
  | AddInput
  | ToolResult;
export type { FlowClientOutgoingMessage };
