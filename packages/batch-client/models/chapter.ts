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
 * @interface Chapter
 */
export interface Chapter {
  /**
   *
   * @type {string}
   * @memberof Chapter
   */
  title?: string;
  /**
   *
   * @type {string}
   * @memberof Chapter
   */
  summary?: string;
  /**
   *
   * @type {number}
   * @memberof Chapter
   */
  start_time?: number;
  /**
   *
   * @type {number}
   * @memberof Chapter
   */
  end_time?: number;
}