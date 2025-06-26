import type { WarningTypeEnum } from './WarningTypeEnum';
interface Warning {
  reason: string;
  message: 'Warning';
  type: WarningTypeEnum;
}
export type { Warning };
