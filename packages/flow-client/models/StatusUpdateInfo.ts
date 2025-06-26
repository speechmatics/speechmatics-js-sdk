import type { StatusUpdateInfoEvent } from './StatusUpdateInfoEvent';
interface StatusUpdateInfo {
  reason: string;
  message: string;
  event: StatusUpdateInfoEvent;
  type: 'status_update';
}
export type { StatusUpdateInfo };
