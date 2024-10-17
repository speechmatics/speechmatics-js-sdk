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
 *
 * @export
 * @interface AutoChaptersResultError
 */
export interface AutoChaptersResultError {
  /**
   *
   * @type {string}
   * @memberof AutoChaptersResultError
   */
  type?: AutoChaptersResultErrorTypeEnum;
  /**
   * Human readable error message
   * @type {string}
   * @memberof AutoChaptersResultError
   */
  message?: string;
}

export const AutoChaptersResultErrorTypeEnum = {
  AutoChaptersFailed: 'auto_chapters_failed',
  UnsupportedLanguage: 'unsupported_language',
} as const;

export type AutoChaptersResultErrorTypeEnum =
  (typeof AutoChaptersResultErrorTypeEnum)[keyof typeof AutoChaptersResultErrorTypeEnum];