import type ErrorTypeEnum from './ErrorTypeEnum';
interface ErrorType {
  message: 'Error';
  type: ErrorTypeEnum;
  reason: string;
  code?: number;
  seq_no?: number;
}
export default ErrorType;
