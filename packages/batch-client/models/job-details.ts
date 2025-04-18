/* tslint:disable */
/* eslint-disable */
/**
 * Speechmatics ASR REST API
 * The Speechmatics Automatic Speech Recognition REST API is used to submit ASR jobs and receive the results. The supported job type is transcription of audio files.
 *
 * The version of the OpenAPI document: 2.0.0
 * Contact: support@speechmatics.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

// May contain unused imports in some cases
// @ts-ignore
import type { JobConfig } from './job-config';
// May contain unused imports in some cases
// @ts-ignore
import type { JobDetailError } from './job-detail-error';

/**
 * Document describing a job. JobConfig will be present in JobDetails returned for GET jobs/<id> request in SaaS and in Batch Appliance, but it will not be present in JobDetails returned as item in RetrieveJobsResponse in case of Batch Appliance.
 * @export
 * @interface JobDetails
 */
export interface JobDetails {
  /**
   * The UTC date time the job was created.
   * @type {string}
   * @memberof JobDetails
   */
  created_at: string;
  /**
   * Name of the data file submitted for job.
   * @type {string}
   * @memberof JobDetails
   */
  data_name: string;
  /**
   * Name of the text file submitted to be aligned to audio.
   * @type {string}
   * @memberof JobDetails
   */
  text_name?: string;
  /**
   * The file duration (in seconds). May be missing for fetch URL jobs.
   * @type {number}
   * @memberof JobDetails
   */
  duration?: number;
  /**
   * The unique id assigned to the job.
   * @type {string}
   * @memberof JobDetails
   */
  id: string;
  /**
   * The status of the job. * `running` - The job is actively running. * `done` - The job completed successfully. * `rejected` - The job was accepted at first, but later could not be processed by the transcriber. * `deleted` - The user deleted the job. * `expired` - The system deleted the job. Usually because the job was in the `done` state for a very long time.
   * @type {string}
   * @memberof JobDetails
   */
  status: JobDetailsStatusEnum;
  /**
   *
   * @type {JobConfig}
   * @memberof JobDetails
   */
  config?: JobConfig;
  /**
   * Optional parameter used for backwards compatibility with v1 api
   * @type {string}
   * @memberof JobDetails
   */
  lang?: string;
  /**
   * Optional list of errors that have occurred in user interaction, for example: audio could not be fetched or notification could not be sent.
   * @type {Array<JobDetailError>}
   * @memberof JobDetails
   */
  errors?: Array<JobDetailError>;
}

export const JobDetailsStatusEnum = {
  Running: 'running',
  Done: 'done',
  Rejected: 'rejected',
  Deleted: 'deleted',
  Expired: 'expired',
} as const;

export type JobDetailsStatusEnum =
  (typeof JobDetailsStatusEnum)[keyof typeof JobDetailsStatusEnum];
