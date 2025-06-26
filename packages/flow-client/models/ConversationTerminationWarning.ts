interface ConversationTerminationWarning {
  reason: string;
  message: 'Warning';
  conversation_termination: number;
  type: 'conversation_termination';
}
export type { ConversationTerminationWarning };
