import type { AudioEventEndData } from './AudioEventEndData';
interface AudioEventEnded {
  message: 'AudioEventEnded';
  event: AudioEventEndData;
}
export type { AudioEventEnded };
