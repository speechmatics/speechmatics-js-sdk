import type { ErrorTypeEnum } from './ErrorTypeEnum';
interface ErrorType {
  message: 'Error';
  type: ErrorTypeEnum;
  reason: string;
}
export type { ErrorType };
