import type RawAudioEncodingEnum from './RawAudioEncodingEnum';
interface AudioFormatRaw {
  type: 'raw';
  encoding: RawAudioEncodingEnum;
  sample_rate: 'raw';
}
export default AudioFormatRaw;
