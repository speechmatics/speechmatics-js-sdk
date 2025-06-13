import type { InfoTypeEnum } from './InfoTypeEnum';
interface Info {
  message: 'Info';
  type: InfoTypeEnum;
  reason: string;
  code?: number;
  seq_no?: number;
  quality?: string;
  usage?: number;
  quota?: number;
  last_updated?: string;
}
export type { Info };
