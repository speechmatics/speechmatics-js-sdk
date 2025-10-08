interface AddChannelAudio {
  message: 'AddChannelAudio';
  /**
   * The channel identifier to which the audio belongs.
   */
  channel: string;
  /**
   * The audio data in base64 format.
   */
  data: string;
}
export type { AddChannelAudio };
