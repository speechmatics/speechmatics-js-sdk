import type { WritingDirectionEnum } from './WritingDirectionEnum';
interface LanguagePackInfo {
  language_description?: string;
  word_delimiter: string;
  writing_direction?: WritingDirectionEnum;
  itn?: boolean;
  adapted?: boolean;
}
export type { LanguagePackInfo };
