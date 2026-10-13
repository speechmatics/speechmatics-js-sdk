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
   * The language that the alternative word is assumed to be spoken in. For the `standard` and `enhanced` models this is always the language requested in the initial `StartRecognition` message. The `melia-1` model detects the language per word, so this value can vary across the transcript.
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
   * This is a set list of profanities and disfluencies respectively that cannot be altered by the end user. `[disfluency]` is present in the [supported languages](https://docs.speechmatics.com/speech-to-text/formatting#supported-languages-for-disfluencies), and `[profanity]` is present in English, Spanish, and Italian
   */
  tags?: RecognitionAlternativeTagsEnum[];
}
export type { RecognitionAlternative };
