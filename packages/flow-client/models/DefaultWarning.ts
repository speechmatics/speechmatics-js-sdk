import type { WarningTypeEnum } from './WarningTypeEnum';
interface DefaultWarning {
  message: 'Warning';
  type: WarningTypeEnum;
  reason: string;
}
export type { DefaultWarning };
