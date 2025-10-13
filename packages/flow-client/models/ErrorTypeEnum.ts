type ErrorTypeEnum =
  | 'asr_error'
  | 'protocol_error'
  | 'config_error'
  | 'idle_timeout'
  | 'session_timeout'
  | 'not_allowed'
  | 'not_authorised'
  | 'quota_exceeded'
  | 'timelimit_exceeded'
  | 'job_error'
  | 'internal_error'
  | 'unknown_error';
export type { ErrorTypeEnum };
