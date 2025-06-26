import type { WarningTypeEnum } from './WarningTypeEnum';
interface Warning {
  reason: string;
  message: string;
  type: WarningTypeEnum;
}
export type { Warning };
