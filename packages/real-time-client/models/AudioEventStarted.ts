import type { AudioEventStartData } from './AudioEventStartData';
interface AudioEventStarted {
  message: 'AudioEventStarted';
  event: AudioEventStartData;
  /**
   * The channel identifier to which the audio belongs. This field is only seen in multichannel.
   */
  channel?: string;
}
export type { AudioEventStarted };
