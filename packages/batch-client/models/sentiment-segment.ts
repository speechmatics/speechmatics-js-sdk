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
 * Represents a segment of text and its associated sentiment.
 * @export
 * @interface SentimentSegment
 */
export interface SentimentSegment {
  /**
   *
   * @type {string}
   * @memberof SentimentSegment
   */
  text?: string;
  /**
   *
   * @type {number}
   * @memberof SentimentSegment
   */
  start_time?: number;
  /**
   *
   * @type {number}
   * @memberof SentimentSegment
   */
  end_time?: number;
  /**
   *
   * @type {string}
   * @memberof SentimentSegment
   */
  sentiment?: string;
  /**
   *
   * @type {string}
   * @memberof SentimentSegment
   */
  speaker?: string;
  /**
   *
   * @type {string}
   * @memberof SentimentSegment
   */
  channel?: string;
  /**
   *
   * @type {number}
   * @memberof SentimentSegment
   */
  confidence?: number;
}