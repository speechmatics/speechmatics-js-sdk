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
 * @interface SummarizationError
 */
export interface SummarizationError {
  /**
   * Human readable error message
   * @type {string}
   * @memberof SummarizationError
   */
  message?: string;
  /**
   *
   * @type {string}
   * @memberof SummarizationError
   */
  type?: SummarizationErrorTypeEnum;
}

export const SummarizationErrorTypeEnum = {
  SummarizationFailed: 'summarization_failed',
  UnsupportedLanguage: 'unsupported_language',
} as const;

export type SummarizationErrorTypeEnum =
  typeof SummarizationErrorTypeEnum[keyof typeof SummarizationErrorTypeEnum];
