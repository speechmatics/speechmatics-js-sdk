import type { RawAudioEncodingEnum } from './RawAudioEncodingEnum';
/**
 * Raw audio samples, described by the following additional mandatory fields:
 */
interface Raw {
  type: 'raw';
  encoding: RawAudioEncodingEnum;
  /**
   * The sample rate of the audio in Hz.
   */
  sample_rate: number;
}
export type { Raw };
