interface ConversationTerminationWarning {
  reason: string;
  message: string;
  conversation_termination: number;
  type: 'conversation_termination';
}
export type { ConversationTerminationWarning };
