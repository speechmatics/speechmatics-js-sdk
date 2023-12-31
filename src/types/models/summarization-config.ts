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
 *
 * @export
 * @interface SummarizationConfig
 */
export interface SummarizationConfig {
  /**
   *
   * @type {string}
   * @memberof SummarizationConfig
   */
  content_type?: SummarizationConfigContentTypeEnum;
  /**
   *
   * @type {string}
   * @memberof SummarizationConfig
   */
  summary_length?: SummarizationConfigSummaryLengthEnum;
  /**
   *
   * @type {string}
   * @memberof SummarizationConfig
   */
  summary_type?: SummarizationConfigSummaryTypeEnum;
}

export const SummarizationConfigContentTypeEnum = {
  Auto: 'auto',
  Informative: 'informative',
  Conversational: 'conversational',
} as const;

export type SummarizationConfigContentTypeEnum =
  typeof SummarizationConfigContentTypeEnum[keyof typeof SummarizationConfigContentTypeEnum];
export const SummarizationConfigSummaryLengthEnum = {
  Brief: 'brief',
  Detailed: 'detailed',
} as const;

export type SummarizationConfigSummaryLengthEnum =
  typeof SummarizationConfigSummaryLengthEnum[keyof typeof SummarizationConfigSummaryLengthEnum];
export const SummarizationConfigSummaryTypeEnum = {
  Paragraphs: 'paragraphs',
  Bullets: 'bullets',
} as const;

export type SummarizationConfigSummaryTypeEnum =
  typeof SummarizationConfigSummaryTypeEnum[keyof typeof SummarizationConfigSummaryTypeEnum];
