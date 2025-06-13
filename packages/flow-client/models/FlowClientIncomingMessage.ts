import type { ConversationStarted } from './ConversationStarted';
import type { AudioAdded } from './AudioAdded';
import type { AddPartialTranscript } from './AddPartialTranscript';
import type { AddTranscript } from './AddTranscript';
import type { ResponseStarted } from './ResponseStarted';
import type { ResponseCompleted } from './ResponseCompleted';
import type { ResponseInterrupted } from './ResponseInterrupted';
import type { ToolInvoke } from './ToolInvoke';
import type { ErrorType } from './ErrorType';
import type { Warning } from './Warning';
import type { Info } from './Info';
import type { ConversationEnding } from './ConversationEnding';
import type { ConversationEnded } from './ConversationEnded';
type FlowClientIncomingMessage =
  | ConversationStarted
  | AudioAdded
  | AddPartialTranscript
  | AddTranscript
  | ResponseStarted
  | ResponseCompleted
  | ResponseInterrupted
  | ToolInvoke
  | ErrorType
  | Warning
  | Info
  | ConversationEnding
  | ConversationEnded;
export type { FlowClientIncomingMessage };
