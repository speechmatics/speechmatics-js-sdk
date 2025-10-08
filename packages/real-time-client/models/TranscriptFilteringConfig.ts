import type { WordReplacementItem } from './WordReplacementItem';
interface TranscriptFilteringConfig {
  /**
   * When set to `true`, removes disfluencies from the transcript. See [Removing disfluencies](https://docs.speechmatics.com/speech-to-text/formatting#removing-disfluencies)
   */
  remove_disfluencies?: boolean;
  /**
   * A list of replacement rules to apply to the transcript. Each rule consists of a pattern to match and a replacement string. See [Word replacement](https://docs.speechmatics.com/speech-to-text/formatting#word-replacement)
   */
  replacements?: WordReplacementItem[];
}
export type { TranscriptFilteringConfig };
