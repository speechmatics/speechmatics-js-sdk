/**
 * Raw audio bytes, in the encoding and sample rate given by `audio_format` in StartRecognition.
 */
type AddAudio = Parameters<WebSocket['send']>[0];
export type { AddAudio };
