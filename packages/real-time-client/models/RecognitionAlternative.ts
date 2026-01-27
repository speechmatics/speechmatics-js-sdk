import type { RecognitionDisplay } from './RecognitionDisplay';
import type { RecognitionAlternativeTagsEnum } from './RecognitionAlternativeTagsEnum';
interface RecognitionAlternative {
  /**
   * A word or punctuation mark.
   */
  content: string;
  /**
   * A confidence score assigned to the alternative. Ranges from 0.0 (least confident) to 1.0 (most confident).
   */
  confidence: number;
  /**
   * The language that the alternative word is assumed to be spoken in. Currently, this will always be equal to the language that was requested in the initial `StartRecognition` message.
   */
  language?: string;
  /**
   * Information about how the word/symbol should be displayed.
   */
  display?: RecognitionDisplay;
  /**
   * Label indicating who said that word. Only set if [diarization](https://docs.speechmatics.com/speech-to-text/features/diarization) is enabled.
   */
  speaker?: string;
  /**
   * This is a set list of profanities and disfluencies respectively that cannot be altered by the end user. `[disfluency]` is only present in English, and `[profanity]` is present in English, Spanish, and Italian
   */
  tags?: RecognitionAlternativeTagsEnum[];
}
export type { RecognitionAlternative };
