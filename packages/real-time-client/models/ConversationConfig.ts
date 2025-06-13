/**
 * This mode will detect when a speaker has stopped talking. The end_of_utterance_silence_trigger is the time in seconds after which the server will assume that the speaker has finished speaking, and will emit an EndOfUtterance message. A value of 0 disables the feature.
 */
interface ConversationConfig {
  end_of_utterance_silence_trigger?: number;
}
export type { ConversationConfig };
