'use client';
import type { RealtimeClient } from '@speechmatics/real-time-client';
import { createContext } from 'react';

export type IRealtimeClientContext = {
  client: RealtimeClient;
  socketState: RealtimeClient['socketState'];
  sessionId?: string;
};
export const RealtimeContext = createContext<IRealtimeClientContext | null>(
  null,
);
