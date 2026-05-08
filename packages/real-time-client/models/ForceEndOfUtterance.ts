interface ForceEndOfUtterance {
  message: 'ForceEndOfUtterance';
  /**
   * The channel to request finalized transcript from. This field is only seen in multichannel.
   */
  channel?: string;
  /**
   * Timestamp of the audio data that corresponds to the force end of utterance request. It's the number of seconds since the beginning of the audio.
   */
  timestamp?: number;
}
export type { ForceEndOfUtterance };
