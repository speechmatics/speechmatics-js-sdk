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
import type { TopicDetectionSegment } from './topic-detection-segment';
// May contain unused imports in some cases
// @ts-ignore
import type { TopicDetectionSummary } from './topic-detection-summary';

/**
 * Main object that holds topic detection results.
 * @export
 * @interface TopicDetectionResult
 */
export interface TopicDetectionResult {
  /**
   * An array of objects that represent a segment of text and its associated topic information.
   * @type {Array<TopicDetectionSegment>}
   * @memberof TopicDetectionResult
   */
  segments?: Array<TopicDetectionSegment>;
  /**
   *
   * @type {TopicDetectionSummary}
   * @memberof TopicDetectionResult
   */
  summary?: TopicDetectionSummary;
}