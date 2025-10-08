import type { EndOfUtteranceMetadata } from './EndOfUtteranceMetadata';
interface EndOfUtterance {
  message: 'EndOfUtterance';
  metadata: EndOfUtteranceMetadata;
  /**
   * The channel identifier to which the EndOfUtterance message belongs. This field is only seen in multichannel.
   */
  channel?: string;
}
export type { EndOfUtterance };
