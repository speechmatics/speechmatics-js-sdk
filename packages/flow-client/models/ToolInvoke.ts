import type { ToolFunction } from './ToolFunction';
interface ToolInvoke {
  message: 'ToolInvoke';
  id: string;
  type: 'function';
  function: ToolFunction;
}
export type { ToolInvoke };
