import type WarningTypeEnum from './WarningTypeEnum';
interface Warning {
  message: 'Warning';
  type: WarningTypeEnum;
  reason: string;
  code?: number;
  seq_no?: number;
  duration_limit?: number;
}
export default Warning;
