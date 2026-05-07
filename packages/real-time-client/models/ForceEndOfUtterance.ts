interface ForceEndOfUtterance {
  message: 'ForceEndOfUtterance';
  /**
   * The channel to request finalized transcript from. This field is only seen in multichannel.
   */
  channel?: string;
}
export type { ForceEndOfUtterance };
