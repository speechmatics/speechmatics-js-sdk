import type AudioEventStartData from './AudioEventStartData';
interface AudioEventStarted {
  message: 'AudioEventStarted';
  event: AudioEventStartData;
}
export default AudioEventStarted;
