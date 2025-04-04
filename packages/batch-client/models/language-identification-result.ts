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

// May contain unused imports in some cases
// @ts-ignore
import type { LanguageIdentificationResultItem } from './language-identification-result-item';

/**
 *
 * @export
 * @interface LanguageIdentificationResult
 */
export interface LanguageIdentificationResult {
  /**
   *
   * @type {Array<LanguageIdentificationResultItem>}
   * @memberof LanguageIdentificationResult
   */
  results?: Array<LanguageIdentificationResultItem>;
  /**
   *
   * @type {string}
   * @memberof LanguageIdentificationResult
   */
  error?: LanguageIdentificationResultErrorEnum;
  /**
   *
   * @type {string}
   * @memberof LanguageIdentificationResult
   */
  message?: string;
}

export const LanguageIdentificationResultErrorEnum = {
  LowConfidence: 'LOW_CONFIDENCE',
  UnexpectedLanguage: 'UNEXPECTED_LANGUAGE',
  NoSpeech: 'NO_SPEECH',
  FileUnreadable: 'FILE_UNREADABLE',
  Other: 'OTHER',
} as const;

export type LanguageIdentificationResultErrorEnum =
  (typeof LanguageIdentificationResultErrorEnum)[keyof typeof LanguageIdentificationResultErrorEnum];
