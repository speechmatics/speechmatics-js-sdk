/* tslint:disable */
/* eslint-disable */
/**
 * Speechmatics ASR REST API
 * The Speechmatics Automatic Speech Recognition REST API is used to submit ASR jobs and receive the results. The supported job type is transcription of audio files.
 *
 * The version of the OpenAPI document: 2.0.0
 * Contact: support@speechmatics.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * Configuration for applying filtering to the transcription
 * @export
 * @interface TranscriptionConfigTranscriptFilteringConfig
 */
export interface TranscriptionConfigTranscriptFilteringConfig {
  /**
   * If true, words that are identified as disfluencies will be removed from the transcript. If false (default), they are tagged in the transcript as \'disfluency\'.
   * @type {boolean}
   * @memberof TranscriptionConfigTranscriptFilteringConfig
   */
  remove_disfluencies?: boolean;
  /**
   * A list of replacements to apply to the transcript. Each replacement is a pair of strings, where the first string is the pattern to be replaced and the second string is the replacement text.
   * @type {Array<object>}
   * @memberof TranscriptionConfigTranscriptFilteringConfig
   */
  replacements?: Array<object>;
}
