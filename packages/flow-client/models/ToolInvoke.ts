import type { ToolFunction } from './ToolFunction';
interface ToolInvoke {
  message: 'ToolInvoke';
  id: string;
  function: ToolFunction;
}
export type { ToolInvoke };
