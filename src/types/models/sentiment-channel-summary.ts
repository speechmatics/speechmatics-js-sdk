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

/**
 * Holds sentiment information for a specific channel.
 * @export
 * @interface SentimentChannelSummary
 */
export interface SentimentChannelSummary {
  /**
   *
   * @type {string}
   * @memberof SentimentChannelSummary
   */
  channel?: string;
  /**
   *
   * @type {number}
   * @memberof SentimentChannelSummary
   */
  negative_count?: number;
  /**
   *
   * @type {number}
   * @memberof SentimentChannelSummary
   */
  neutral_count?: number;
  /**
   *
   * @type {number}
   * @memberof SentimentChannelSummary
   */
  positive_count?: number;
}
