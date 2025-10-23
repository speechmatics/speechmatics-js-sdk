/**
 * Specifies various configuration values for translation. All fields except `target_languages` are optional, using default values when omitted.
 */
interface TranslationConfig {
  /**
   * List of languages to translate to from the source transcription `language`. Specified as an [ISO Language Code](https://docs.speechmatics.com/speech-to-text/languages).
   */
  target_languages: string[];
  /**
   * Whether or not to send Partials (i.e. `AddPartialTranslation` messages) as well as Finals (i.e. `AddTranslation` messages).
   */
  enable_partials?: boolean;
}
export type { TranslationConfig };
