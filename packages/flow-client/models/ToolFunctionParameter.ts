import type { ToolFunctionParameterTypeEnum } from './ToolFunctionParameterTypeEnum';
interface ToolFunctionParameter {
  type: ToolFunctionParameterTypeEnum;
  description?: string;
  enum?: (string | number)[];
  example?: unknown;
}
export type { ToolFunctionParameter };
