/**
 * Set to `speaker` to apply [Speaker Diarization](https://docs.speechmatics.com/speech-to-text/features/diarization) to the audio.
 */
type DiarizationConfig = 'none' | 'speaker' | 'channel' | 'channel_and_speaker';
export type { DiarizationConfig };
