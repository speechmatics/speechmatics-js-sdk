import type { ToolFunctionParametersTypeEnum } from './ToolFunctionParametersTypeEnum';
import type { ToolFunctionParameter } from './ToolFunctionParameter';
interface ToolFunctionParameters {
  type?: ToolFunctionParametersTypeEnum;
  required?: string[];
  properties?: { [name: string]: ToolFunctionParameter };
}
export type { ToolFunctionParameters };
