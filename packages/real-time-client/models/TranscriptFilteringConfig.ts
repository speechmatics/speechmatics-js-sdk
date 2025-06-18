import type { WordReplacementItem } from './WordReplacementItem';
interface TranscriptFilteringConfig {
  remove_disfluencies?: boolean;
  /**
   * A list of replacement rules to apply to the transcript. Each rule consists of a pattern to match and a replacement string.
   */
  replacements?: WordReplacementItem[][];
}
export type { TranscriptFilteringConfig };
