import type { AudioEventEndData } from './AudioEventEndData';
interface AudioEventEnded {
  message: 'AudioEventEnded';
  event: AudioEventEndData;
  /**
   * The channel identifier to which the audio belongs. This field is only seen in multichannel.
   */
  channel?: string;
}
export type { AudioEventEnded };
