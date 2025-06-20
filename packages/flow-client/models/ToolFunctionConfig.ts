import type { ToolFunctionParameters } from './ToolFunctionParameters';
interface ToolFunctionConfig {
  name: string;
  description?: string;
  parameters?: ToolFunctionParameters;
}
export type { ToolFunctionConfig };
