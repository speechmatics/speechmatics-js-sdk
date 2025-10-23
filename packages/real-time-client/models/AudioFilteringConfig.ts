/**
 * Puts a lower limit on the volume of processed audio by using the `volume_threshold` setting. See [Audio Filtering](https://docs.speechmatics.com/speech-to-text/features/audio-filtering).
 */
interface AudioFilteringConfig {
  volume_threshold?: number;
}
export type { AudioFilteringConfig };
