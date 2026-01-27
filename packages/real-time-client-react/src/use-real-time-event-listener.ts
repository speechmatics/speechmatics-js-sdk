'use client';
import type {
  RealtimeClient,
  RealtimeClientEventMap,
} from '@speechmatics/real-time-client';
import { useContext, useEffect } from 'react';
import type { TypedEventListenerOrEventListenerObject } from 'typescript-event-target';
import { RealtimeContext } from './real-time-context';

export function useRealtimeEventListener<
  E extends keyof RealtimeClientEventMap,
>(
  message: E,
  cb: TypedEventListenerOrEventListenerObject<RealtimeClientEventMap, E>,
) {
  const context = useContext(RealtimeContext);
  if (context === null) {
    throw new Error('Realtime client uninitialized in context');
  }

  return useClientEventListener(context.client, message, cb);
}

export function useClientEventListener<K extends keyof RealtimeClientEventMap>(
  client: RealtimeClient,
  eventType: K,
  cb: TypedEventListenerOrEventListenerObject<RealtimeClientEventMap, K>,
) {
  return useEffect(() => {
    client.addEventListener(eventType, cb);
    return () => client?.removeEventListener(eventType, cb);
  }, [client, eventType, cb]);
}
