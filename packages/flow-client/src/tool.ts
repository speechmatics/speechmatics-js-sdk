export type ToolType = 'function';

export interface Tool {
  type: ToolType;
  function: {
    name: string;
    description: string;
    parameters?: ReadonlyArray<ToolParameter>;
  };
}

export type ToolStringType = { type: 'string'; example?: string };
export type ToolObjectType = {
  type: 'object';
  properties: Record<string, ToolParameter>;
};

export type ToolParameter = ToolStringType | ToolObjectType;
