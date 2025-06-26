interface ConcurrentSessionUsageInfo {
  reason: string;
  message: string;
  usage: number;
  quota: number;
  last_udpated?: string;
  type: 'concurrent_session_usage';
}
export type { ConcurrentSessionUsageInfo };
