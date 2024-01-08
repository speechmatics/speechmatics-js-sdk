/* tslint:disable */
/* eslint-disable */
/**
 * OpenAPI Template
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

// May contain unused imports in some cases
// @ts-ignore
import { AudioEventSummaryItem } from './audio-event-summary-item';

/**
 * Summary statistics per event type, keyed by `type`, e.g. music
 * @export
 * @interface RetrieveTranscriptResponseAudioEventSummary
 */
export interface RetrieveTranscriptResponseAudioEventSummary {
  /**
   * Summary keyed by channel, only set if channel diarization is enabled
   * @type {{ [key: string]: Array<{ [key: string]: Array<AudioEventSummaryItem>; }>; }}
   * @memberof RetrieveTranscriptResponseAudioEventSummary
   */
  channels?: {
    [key: string]: Array<{ [key: string]: Array<AudioEventSummaryItem> }>;
  };
  /**
   *
   * @type {{ [key: string]: Array<AudioEventSummaryItem>; }}
   * @memberof RetrieveTranscriptResponseAudioEventSummary
   */
  overall?: { [key: string]: Array<AudioEventSummaryItem> };
}
