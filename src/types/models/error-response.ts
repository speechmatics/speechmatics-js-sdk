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
 * @interface ErrorResponse
 */
export interface ErrorResponse {
  /**
   * The HTTP status code.
   * @type {number}
   * @memberof ErrorResponse
   */
  code: number;
  /**
   * The details of the error.
   * @type {string}
   * @memberof ErrorResponse
   */
  detail?: string;
  /**
   * The error message.
   * @type {string}
   * @memberof ErrorResponse
   */
  error: ErrorResponseErrorEnum;
}

export const ErrorResponseErrorEnum = {
  BadRequest: 'Bad Request',
  FileExpired: 'File Expired',
  Forbidden: 'Forbidden',
  ResourceLocked: 'Resource Locked',
  FormatNotSupported: 'Format Not Supported',
  InternalServerError: 'Internal Server Error',
  JobError: 'Job error',
  JobExpired: 'Job Expired',
  JobInProgress: 'Job In Progress',
  JobIsNotOfTypeAlignment: 'Job is not of type alignment',
  JobIsNotOfTypeTranscription: 'Job is not of type transcription',
  JobNotFound: 'Job not found',
  JobRejected: 'Job rejected',
  JobRejectedDueToInvalidAudio: 'Job rejected due to invalid audio',
  JobRejectedDueToInvalidText: 'Job rejected due to invalid text',
  MalformedRequest: 'Malformed request',
  MissingCallback: 'Missing callback',
  MissingDataFile: 'Missing data_file',
  MissingTextFile: 'Missing text_file',
  NoLanguageSelected: 'No language selected',
  NotImplemented: 'Not Implemented',
  PermissionDenied: 'Permission Denied',
  RequestedProductNotAvailable: 'Requested product not available',
  TranscriptionNotReady: 'Transcription not ready',
  LogFileNotAvailable: 'Log file not available',
  RequestedEarlyAccessReleaseNotAvailable:
    'Requested Early Access Release not available',
  UnprocessableEntity: 'Unprocessable Entity',
} as const;

export type ErrorResponseErrorEnum =
  typeof ErrorResponseErrorEnum[keyof typeof ErrorResponseErrorEnum];
