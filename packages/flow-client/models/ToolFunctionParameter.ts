import type { ToolFunctionParameterTypeEnum } from './ToolFunctionParameterTypeEnum';
interface ToolFunctionParameter {
  type: ToolFunctionParameterTypeEnum;
  description?: string;
  enum?: any[];
  example?: any;
}
export type { ToolFunctionParameter };
