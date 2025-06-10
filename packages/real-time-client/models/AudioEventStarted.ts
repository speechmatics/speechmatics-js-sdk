import type { AudioEventStartData } from './AudioEventStartData';
interface AudioEventStarted {
  message: 'AudioEventStarted';
  event: AudioEventStartData;
}
export type { AudioEventStarted };
