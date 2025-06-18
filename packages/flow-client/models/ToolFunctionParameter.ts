import type { ToolFunctionParameterTypeEnum } from './ToolFunctionParameterTypeEnum';
interface ToolFunctionParameter {
  type: ToolFunctionParameterTypeEnum;
  description?: string;
  enum?: (string | number)[];
  example?: string | boolean | number;
}
export type { ToolFunctionParameter };
