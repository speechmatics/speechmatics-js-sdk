/**
 * The following are the possible error types:
 *
 * | Error Type | Description |
 * | --- | --- |
 * | `invalid_message` | The message received was not understood. |
 * | `invalid_model` | Unable to use the model for the recognition. This can happen if the language is not supported at all, or is not available for the user. |
 * | `invalid_language` | The requested language is not valid or is not supported. |
 * | `invalid_config` | The config received contains some wrong or unsupported fields, or too many translation target languages were requested. |
 * | `invalid_audio_type` | Audio type is not supported, is deprecated, or the `audio_type` is malformed. |
 * | `invalid_output_format` | Output format is not supported, is deprecated, or the `output_format` is malformed. |
 * | `not_authorised` | User was not recognised, or the API key provided is not valid. |
 * | `not_allowed` | User is not allowed to use this message (is not allowed to perform the action the message would invoke). |
 * | `job_error` | Unable to do any work on this job, the server might have timed out etc. |
 * | `protocol_error` | Message received was syntactically correct, but could not be accepted due to protocol limitations. This is usually caused by messages sent in the wrong order. |
 * | `quota_exceeded` | Maximum number of concurrent connections allowed for the contract has been reached |
 * | `timelimit_exceeded` | Usage quota for the contract has been reached |
 * | `idle_timeout` | Idle duration limit was reached (no audio data sent within the last hour), a closing handshake with code 1008 follows this in-band error. |
 * | `session_timeout` | Max session duration was reached (maximum session duration of 48 hours), a closing handshake with code 1008 follows this in-band error. |
 * | `unknown_error` | An error that did not fit any of the types above. |
 *
 * :::info
 *
 * `invalid_message`, `protocol_error` and `unknown_error` can be triggered as a response to any type of messages.
 *
 * :::
 */
type ErrorTypeEnum =
  | 'invalid_message'
  | 'invalid_model'
  | 'invalid_language'
  | 'invalid_config'
  | 'invalid_audio_type'
  | 'invalid_output_format'
  | 'not_authorised'
  | 'not_allowed'
  | 'job_error'
  | 'protocol_error'
  | 'quota_exceeded'
  | 'timelimit_exceeded'
  | 'idle_timeout'
  | 'session_timeout'
  | 'unknown_error';
export type { ErrorTypeEnum };
