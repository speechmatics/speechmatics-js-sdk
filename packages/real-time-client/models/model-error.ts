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
 * @interface ModelError
 */
export interface ModelError {
  /**
   *
   * @type {string}
   * @memberof ModelError
   */
  message: ModelErrorMessageEnum;
  /**
   *
   * @type {string}
   * @memberof ModelError
   */
  type: ModelErrorTypeEnum;
  /**
   *
   * @type {string}
   * @memberof ModelError
   */
  reason: string;
  /**
   *
   * @type {number}
   * @memberof ModelError
   */
  code?: number;
  /**
   *
   * @type {number}
   * @memberof ModelError
   */
  seq_no?: number;
}

export const ModelErrorMessageEnum = {
  Error: 'Error',
} as const;

export type ModelErrorMessageEnum =
  (typeof ModelErrorMessageEnum)[keyof typeof ModelErrorMessageEnum];
export const ModelErrorTypeEnum = {
  InvalidMessage: 'invalid_message',
  InvalidModel: 'invalid_model',
  InvalidConfig: 'invalid_config',
  InvalidAudioType: 'invalid_audio_type',
  NotAuthorised: 'not_authorised',
  InsufficientFunds: 'insufficient_funds',
  NotAllowed: 'not_allowed',
  JobError: 'job_error',
  DataError: 'data_error',
  BufferError: 'buffer_error',
  ProtocolError: 'protocol_error',
  TimelimitExceeded: 'timelimit_exceeded',
  QuotaExceeded: 'quota_exceeded',
  UnknownError: 'unknown_error',
} as const;

export type ModelErrorTypeEnum =
  (typeof ModelErrorTypeEnum)[keyof typeof ModelErrorTypeEnum];
