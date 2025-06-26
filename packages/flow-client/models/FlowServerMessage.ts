import type { ConversationStarted } from './ConversationStarted';
import type { AudioAdded } from './AudioAdded';
import type { AddPartialTranscript } from './AddPartialTranscript';
import type { AddTranscript } from './AddTranscript';
import type { ResponseStarted } from './ResponseStarted';
import type { ResponseCompleted } from './ResponseCompleted';
import type { ResponseInterrupted } from './ResponseInterrupted';
import type { ToolInvoke } from './ToolInvoke';
import type { ErrorType } from './ErrorType';
import type { DefaultWarning } from './DefaultWarning';
import type { ConversationTermination } from './ConversationTermination';
import type { Info } from './Info';
import type { StatusUpdateInfo } from './StatusUpdateInfo';
import type { ConversationDurationLimitInfo } from './ConversationDurationLimitInfo';
import type { ConcurrentSessionUsageInfo } from './ConcurrentSessionUsageInfo';
import type { ConversationEnding } from './ConversationEnding';
import type { ConversationEnded } from './ConversationEnded';
type FlowServerMessage =
  | ConversationStarted
  | AudioAdded
  | AddPartialTranscript
  | AddTranscript
  | ResponseStarted
  | ResponseCompleted
  | ResponseInterrupted
  | ToolInvoke
  | ErrorType
  | DefaultWarning
  | ConversationTermination
  | Info
  | StatusUpdateInfo
  | ConversationDurationLimitInfo
  | ConcurrentSessionUsageInfo
  | ConversationEnding
  | ConversationEnded;
export type { FlowServerMessage };
