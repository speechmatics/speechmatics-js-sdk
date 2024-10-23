import type { FlowClient, FlowClientEventMap } from '@speechmatics/flow-client';
import { useEffect } from 'react';
import type { TypedEventListenerOrEventListenerObject } from 'typescript-event-target';

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
