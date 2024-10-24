'use client';
import type { FlowClient } from '@speechmatics/flow-client';
import { createContext } from 'react';

export type IFlowClientContext = {
  client: FlowClient;
  socketState: FlowClient['socketState'];
  sessionId?: string;
};
export const FlowContext = createContext<IFlowClientContext | null>(null);
