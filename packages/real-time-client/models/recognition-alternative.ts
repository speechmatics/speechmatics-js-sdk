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
import type { RecognitionDisplay } from './recognition-display';

/**
 *
 * @export
 * @interface RecognitionAlternative
 */
export interface RecognitionAlternative {
  /**
   *
   * @type {string}
   * @memberof RecognitionAlternative
   */
  content: string;
  /**
   *
   * @type {number}
   * @memberof RecognitionAlternative
   */
  confidence: number;
  /**
   *
   * @type {string}
   * @memberof RecognitionAlternative
   */
  language?: string;
  /**
   *
   * @type {RecognitionDisplay}
   * @memberof RecognitionAlternative
   */
  display?: RecognitionDisplay;
  /**
   *
   * @type {string}
   * @memberof RecognitionAlternative
   */
  speaker?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof RecognitionAlternative
   */
  tags?: Array<string>;
}