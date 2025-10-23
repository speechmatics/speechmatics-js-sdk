interface EndOfChannel {
  message: 'EndOfChannel';
  /**
   * The channel identifier to which the audio belongs.
   */
  channel: string;
  last_seq_no: number;
}
export type { EndOfChannel };
