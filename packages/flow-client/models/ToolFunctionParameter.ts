import type { ToolFunctionParameterTypeEnum } from './ToolFunctionParameterTypeEnum';
interface ToolFunctionParameter {
  type: ToolFunctionParameterTypeEnum;
  description?: string;
  enum?: (string | number | boolean)[];
  example?: string;
}
export type { ToolFunctionParameter };
