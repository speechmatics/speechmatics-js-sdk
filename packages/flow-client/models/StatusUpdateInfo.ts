import type { StatusUpdateInfoEvent } from './StatusUpdateInfoEvent';
interface StatusUpdateInfo {
  message: 'Info';
  type: 'status_update';
  event: StatusUpdateInfoEvent;
}
export type { StatusUpdateInfo };
