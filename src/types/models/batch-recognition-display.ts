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
 * @interface BatchRecognitionDisplay
 */
export interface BatchRecognitionDisplay {
  /**
   *
   * @type {string}
   * @memberof BatchRecognitionDisplay
   */
  direction: BatchRecognitionDisplayDirectionEnum;
}

export const BatchRecognitionDisplayDirectionEnum = {
  Ltr: 'ltr',
  Rtl: 'rtl',
} as const;

export type BatchRecognitionDisplayDirectionEnum =
  typeof BatchRecognitionDisplayDirectionEnum[keyof typeof BatchRecognitionDisplayDirectionEnum];
