'use client';
import type { FlowClient, FlowClientEventMap } from '@speechmatics/flow-client';
import { useContext, useEffect } from 'react';
import type { TypedEventListenerOrEventListenerObject } from 'typescript-event-target';
import { FlowContext } from './flow-context';

export function useFlowEventListener<E extends keyof FlowClientEventMap>(
  message: E,
  cb: TypedEventListenerOrEventListenerObject<FlowClientEventMap, E>,
) {
  const context = useContext(FlowContext);
  if (context === null) {
    throw new Error('Flow client uninitialized in context');
  }

  return useClientEventListener(context.client, message, cb);
}

export function useClientEventListener<K extends keyof FlowClientEventMap>(
  client: FlowClient,
  eventType: K,
  cb: TypedEventListenerOrEventListenerObject<FlowClientEventMap, K>,
) {
  return useEffect(() => {
    client.addEventListener(eventType, cb);
    return () => client?.removeEventListener(eventType, cb);
  }, [client, eventType, cb]);
}
