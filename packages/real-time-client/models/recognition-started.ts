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
 * @interface RecognitionStarted
 */
export interface RecognitionStarted {
  /**
   *
   * @type {string}
   * @memberof RecognitionStarted
   */
  message: RecognitionStartedMessageEnum;
  /**
   *
   * @type {string}
   * @memberof RecognitionStarted
   */
  id?: string;
}

export const RecognitionStartedMessageEnum = {
  RecognitionStarted: 'RecognitionStarted',
} as const;

export type RecognitionStartedMessageEnum =
  (typeof RecognitionStartedMessageEnum)[keyof typeof RecognitionStartedMessageEnum];
