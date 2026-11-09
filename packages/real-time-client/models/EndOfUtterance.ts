import type { EndOfUtteranceMetadata } from './EndOfUtteranceMetadata';
interface EndOfUtterance {
  message: 'EndOfUtterance';
  metadata: EndOfUtteranceMetadata;
  /**
   * The channel identifier to which the EndOfUtterance message belongs. This field is only seen in multichannel.
   */
  channel?: string;
  /**
   * Whether this message was triggered by a `ForceEndOfUtterance` message. This field is only seen on forced messages, where its value is `true`.
   */
  forced?: boolean;
}
export type { EndOfUtterance };
