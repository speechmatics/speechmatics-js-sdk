type ErrorTypeEnum =
  | 'invalid_message'
  | 'invalid_model'
  | 'invalid_config'
  | 'invalid_audio_type'
  | 'not_authorised'
  | 'insufficient_funds'
  | 'not_allowed'
  | 'job_error'
  | 'data_error'
  | 'buffer_error'
  | 'protocol_error'
  | 'timelimit_exceeded'
  | 'quota_exceeded'
  | 'unknown_error';
export default ErrorTypeEnum;
