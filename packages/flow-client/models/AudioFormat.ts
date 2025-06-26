import type { AudioFormatRawEncodingEnum } from './AudioFormatRawEncodingEnum';
interface AudioFormat {
  type: 'raw';
  encoding?: AudioFormatRawEncodingEnum;
  sample_rate?: number;
}
export type { AudioFormat };
