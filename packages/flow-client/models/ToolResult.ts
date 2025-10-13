import type { StatusEnum } from './StatusEnum';
interface ToolResult {
  message: 'ToolResult';
  id: string;
  status: StatusEnum;
  content?: string;
}
export type { ToolResult };
