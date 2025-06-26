import type { StatusUpdateInfoEvent } from './StatusUpdateInfoEvent';
interface StatusUpdateInfo {
  reason: string;
  message: 'Info';
  event: StatusUpdateInfoEvent;
  type: 'status_update';
}
export type { StatusUpdateInfo };
