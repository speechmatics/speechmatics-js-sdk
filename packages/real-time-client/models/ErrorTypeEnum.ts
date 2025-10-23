/**
 * The following are the possible error types:
 *
 * | Error Type | Description |
 * | --- | --- |
 * | `invalid_message` | The message received was not understood. |
 * | `invalid_model` | Unable to use the model for the recognition. This can happen if the language is not supported at all, or is not available for the user. |
 * | `invalid_config` | The config received contains some wrong or unsupported fields, or too many translation target languages were requested. |
 * | `invalid_audio_type` | Audio type is not supported, is deprecated, or the `audio_type` is malformed. |
 * | `invalid_output_format` | Output format is not supported, is deprecated, or the `output_format` is malformed. |
 * | `not_authorised` | User was not recognised, or the API key provided is not valid. |
 * | `insufficient_funds` | User doesn't have enough credits or any other reason preventing the user to be charged for the job properly. |
 * | `not_allowed` | User is not allowed to use this message (is not allowed to perform the action the message would invoke). |
 * | `job_error` | Unable to do any work on this job, the server might have timed out etc. |
 * | `data_error` | Unable to accept the data specified - usually because there is too much data being sent at once |
 * | `buffer_error` | Unable to fit the data in a corresponding buffer. This can happen for clients sending the input data faster than real-time. |
 * | `protocol_error` | Message received was syntactically correct, but could not be accepted due to protocol limitations. This is usually caused by messages sent in the wrong order. |
 * | `quota_exceeded` | Maximum number of concurrent connections allowed for the contract has been reached |
 * | `timelimit_exceeded` | Usage quota for the contract has been reached |
 * | `idle_timeout` | Idle duration limit was reached (no audio data sent within the last hour), a closing handshake with code 1008 follows this in-band error. |
 * | `session_timeout` | Max session duration was reached (maximum session duration of 48 hours), a closing handshake with code 1008 follows this in-band error. |
 * | `session_transfer` | An error while transferring session to another backend with the reason: Session transfer failed. This may occur when moving sessions due to backend maintenance operations or migration from a faulty backend. |
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
  | 'invalid_config'
  | 'invalid_audio_type'
  | 'invalid_output_format'
  | 'not_authorised'
  | 'insufficient_funds'
  | 'not_allowed'
  | 'job_error'
  | 'data_error'
  | 'buffer_error'
  | 'protocol_error'
  | 'quota_exceeded'
  | 'timelimit_exceeded'
  | 'idle_timeout'
  | 'session_timeout'
  | 'session_transfer'
  | 'unknown_error';
export type { ErrorTypeEnum };
