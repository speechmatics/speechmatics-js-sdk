import type { ToolTypeEnum } from './ToolTypeEnum';
import type { ToolFunctionConfig } from './ToolFunctionConfig';
interface ToolConfig {
  type: ToolTypeEnum;
  function: ToolFunctionConfig;
}
export type { ToolConfig };
