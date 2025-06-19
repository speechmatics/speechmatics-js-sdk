import type { WordReplacementItem } from './WordReplacementItem';
interface TranscriptFilteringConfig {
  remove_disfluencies?: boolean;
  replacements?: WordReplacementItem[];
}
export type { TranscriptFilteringConfig };
