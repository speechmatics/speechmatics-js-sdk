type WarningTypeEnum =
  | 'conversation_termination'
  | 'high_asr_latency'
  | 'llm_error'
  | 'high_llm_latency'
  | 'llm_request_content_filter'
  | 'tts_error'
  | 'high_tts_latency'
  | 'protocol_error'
  | 'idle_timeout'
  | 'session_timeout';
export type { WarningTypeEnum };
