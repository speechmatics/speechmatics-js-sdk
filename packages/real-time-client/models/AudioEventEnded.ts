import type AudioEventEndData from './AudioEventEndData';
interface AudioEventEnded {
  message: 'AudioEventEnded';
  event: AudioEventEndData;
}
export default AudioEventEnded;
