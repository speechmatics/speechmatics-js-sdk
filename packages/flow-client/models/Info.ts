import type { InfoTypeEnum } from './InfoTypeEnum';
interface Info {
  message: 'Info';
  type: InfoTypeEnum;
  reason: string;
  code?: number;
  seq_no?: number;
  quality?: string;
}
export type { Info };
