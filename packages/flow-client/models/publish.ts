import type { StartConversation } from './StartConversation';
import type { AudioReceived } from './AudioReceived';
import type { AudioEnded } from './AudioEnded';
import type { AddInput } from './AddInput';
import type { ToolResult } from './ToolResult';
type publish =
  | StartConversation
  | string
  | AudioReceived
  | AudioEnded
  | AddInput
  | ToolResult;
export type { publish };
