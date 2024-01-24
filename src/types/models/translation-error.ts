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
 * @interface TranslationError
 */
export interface TranslationError {
  /**
   * Human readable error message
   * @type {string}
   * @memberof TranslationError
   */
  message?: string;
  /**
   *
   * @type {string}
   * @memberof TranslationError
   */
  type?: TranslationErrorTypeEnum;
}

export const TranslationErrorTypeEnum = {
  TranslationFailed: 'translation_failed',
  UnsupportedTranslationPair: 'unsupported_translation_pair',
} as const;

export type TranslationErrorTypeEnum =
  typeof TranslationErrorTypeEnum[keyof typeof TranslationErrorTypeEnum];