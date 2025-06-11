import type { AudioFormatRawTypeEnum } from './AudioFormatRawTypeEnum';
import type { AudioFormatRawEncodingEnum } from './AudioFormatRawEncodingEnum';
interface AudioFormatRaw {
  type: AudioFormatRawTypeEnum;
  encoding: AudioFormatRawEncodingEnum;
  sample_rate: number;
}
export type { AudioFormatRaw };
