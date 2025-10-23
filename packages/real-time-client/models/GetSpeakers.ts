interface GetSpeakers {
  message: 'GetSpeakers';
  /**
   * Optional. This flag controls when speaker identifiers are returned. Defaults to false if omitted.
   * When false, multiple GetSpeakers requests can be sent during transcription, each returning the speaker identifiers generated so far. To reduce the chance of empty results, send requests after at least one TranscriptAdded message is received to make sure that the server has processed some audio.
   * When true, speaker identifiers are returned only once at the end of the transcription, regardless of how many final: true requests are sent. Even with final: true requests, you can still send final: false requests to receive intermediate speaker identifier updates.
   */
  final?: boolean;
}
export type { GetSpeakers };
