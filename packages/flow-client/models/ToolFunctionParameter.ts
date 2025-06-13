import type { ToolFunctionParameterTypeEnum } from './ToolFunctionParameterTypeEnum';
interface ToolFunctionParameter {
  type: ToolFunctionParameterTypeEnum;
  description?: string;
  enum?: unknown[];
  example?: string;
}
export type { ToolFunctionParameter };
