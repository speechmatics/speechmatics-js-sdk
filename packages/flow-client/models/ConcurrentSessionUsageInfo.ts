interface ConcurrentSessionUsageInfo {
  message: 'Info';
  type: 'concurrent_session_usage';
  usage: number;
  quota: number;
  last_udpated?: string;
}
export type { ConcurrentSessionUsageInfo };
