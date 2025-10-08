/**
 * The following are the possible warning types:
 *
 * | Warning Type | Description |
 * | --- | --- |
 * | `duration_limit_exceeded` | The maximum allowed duration of a single utterance to process has been exceeded. Any `AddAudio` messages received that exceed this limit are confirmed with `AudioAdded`, but are ignored by the transcription engine. Exceeding the limit triggers the same mechanism as receiving an `EndOfStream` message, so the Server will eventually send an `EndOfTranscript` message and suspend.
 * | `unsupported_translation_pair` | One of the requested translation target languages is unsupported (given the source audio language). The error message specifies the unsupported language pair.
 * | `idle_timeout` | Informs that the session is approaching the idle duration limit (no audio data sent within the last hour), with a `reason` of the form: <p>`Session will timeout in {time_remaining}m due to inactivity, no audio sent within the last {time_elapsed}m`</p> Currently the server will send messages at 15, 10 and 5m prior to timeout, and will send a final error message on timeout, before closing the connection with the code 1008. (see [Realtime limits](https://docs.speechmatics.com/speech-to-text/realtime/limits) for more information).
 * | `session_timeout` | Informs that the session is approaching the max session duration limit (maximum session duration of 48 hours), with a `reason` of the form: <p>`Session will timeout in {time_remaining}m due to max duration, session has been active for {time_elapsed}m`</p> Currently the server will send messages at 45, 30 and 15m prior to timeout, and will send a final error message on timeout, before closing the connection with the code 1008. (see [Realtime limits](https://docs.speechmatics.com/speech-to-text/realtime/limits) for more information).|
 * | `empty_translation_target_list` | No supported translation target languages specified. Translation will not run.
 * | `add_audio_after_eos` | Protocol specification doesn't allow adding audio after `EndOfStream` has been received. Any `AddAudio messages after this, will be ignored.
 * | `speaker_id` | Informs the client about any speaker ID related issues. |
 */
type WarningTypeEnum =
  | 'duration_limit_exceeded'
  | 'unsupported_translation_pair'
  | 'idle_timeout'
  | 'session_timeout'
  | 'empty_translation_target_list'
  | 'add_audio_after_eos'
  | 'speaker_id';
export type { WarningTypeEnum };
