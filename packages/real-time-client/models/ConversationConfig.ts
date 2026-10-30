/**
 * This mode will detect when a speaker has stopped talking. The `end_of_utterance_silence_trigger` is the time in seconds after which the server will assume that the speaker has finished speaking, and will emit an `EndOfUtterance` message. A value of 0 disables the feature. Supported by Enhanced and Standard. Melia 1 and Oak 1 reject `end_of_utterance_silence_trigger` in `conversation_config`; use client-side turn detection and send `ForceEndOfUtterance` instead.
 */
interface ConversationConfig {
  end_of_utterance_silence_trigger?: number;
}
export type { ConversationConfig };
