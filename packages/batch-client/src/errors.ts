import type {
  ErrorResponse,
  ErrorResponseErrorEnum,
} from '../models/error-response';
import type { JobDetails, JobDetailsStatusEnum } from '../models/job-details';

/** Terminal job statuses other than `done` */
export type JobFailedStatus = Exclude<JobDetailsStatusEnum, 'running' | 'done'>;

/**
 * The `error` string of an API error response. Known values are typed via `ErrorResponseErrorEnum`,
 * but any string is accepted so that errors the API adds later are still surfaced as-is.
 */
// `string & {}` keeps editor autocompletion for the known values
export type SpeechmaticsResponseErrorCode =
  | ErrorResponseErrorEnum
  | (string & {});

/** An API error response body */
export type SpeechmaticsErrorResponse = Omit<ErrorResponse, 'error'> & {
  error: SpeechmaticsResponseErrorCode;
};

function isErrorResponse(value: unknown): value is SpeechmaticsErrorResponse {
  if (typeof value !== 'object' || value === null) return false;
  const { code, error, detail } = value as Record<string, unknown>;
  return (
    typeof code === 'number' &&
    typeof error === 'string' &&
    (detail === undefined || typeof detail === 'string')
  );
}

type SpeechmaticsErrorCode = InternalErrorEnum | SpeechmaticsResponseErrorCode;
interface SpeechmaticsErrorInterface extends Error {
  error: SpeechmaticsErrorCode;
}

export class SpeechmaticsResponseError
  extends Error
  implements SpeechmaticsErrorInterface
{
  response: SpeechmaticsErrorResponse;
  error: SpeechmaticsResponseErrorCode;

  /** @throws {SpeechmaticsUnexpectedResponse} if `errorResponse` isn't a valid API error response */
  constructor(errorResponse: unknown) {
    if (!isErrorResponse(errorResponse)) {
      throw new SpeechmaticsUnexpectedResponse(undefined, errorResponse);
    }
    const { error, detail } = errorResponse;
    super(detail ? `${error}: ${detail}` : error);
    this.response = errorResponse;
    this.error = error;
    this.name = 'SpeechmaticsResponseError';
  }
}

export const InternalErrorEnum = {
  ConfigurationError: 'Configuration error',
  NetworkError: 'Network error',
  UnsupportedEnvironment: 'Unsupported environment',
  UnexpectedMessage: 'Unexpected message',
  UnexpectedResponse: 'Unexpected response',
  InvalidTypeError: 'Invalid type error',
  JobFailed: 'Job failed',
} as const;

export type InternalErrorEnum =
  (typeof InternalErrorEnum)[keyof typeof InternalErrorEnum];

class SpeechmaticsInternalError extends Error {
  error: InternalErrorEnum;
  cause?: unknown; // e.g. a caught error or response

  constructor(error: InternalErrorEnum, message?: string, cause?: unknown) {
    super(message ?? error);
    this.name = 'SpeechmaticsInternalError';
    this.error = error;
    this.cause = cause;
  }
}

export class SpeechmaticsConfigurationError extends SpeechmaticsInternalError {
  constructor(message?: string) {
    super(InternalErrorEnum.ConfigurationError, message);
    this.name = 'SpeechmaticsConfigurationError';
  }
}
export class SpeechmaticsNetworkError extends SpeechmaticsInternalError {
  constructor(message?: string, cause?: unknown) {
    super(InternalErrorEnum.NetworkError, message, cause);
    this.name = 'SpeechmaticsNetworkError';
  }
}
export class SpeechmaticsUnsupportedEnvironment extends SpeechmaticsInternalError {
  constructor(message?: string) {
    super(InternalErrorEnum.UnsupportedEnvironment, message);
    this.name = 'SpeechmaticsUnsupportedEnvironment';
  }
}
export class SpeechmaticsUnexpectedMessage extends SpeechmaticsInternalError {
  constructor(message?: string) {
    super(InternalErrorEnum.UnexpectedMessage, message);
    this.name = 'SpeechmaticsUnexpectedMessage';
  }
}
export class SpeechmaticsUnexpectedResponse extends SpeechmaticsInternalError {
  constructor(message?: string, response?: unknown) {
    super(InternalErrorEnum.UnexpectedResponse, message, response);
    this.name = 'SpeechmaticsUnexpectedResponse';
  }
}
export class SpeechmaticsInvalidTypeError extends SpeechmaticsInternalError {
  constructor(message?: string, cause?: unknown) {
    super(InternalErrorEnum.InvalidTypeError, message, cause);
    this.name = 'SpeechmaticsInvalidTypeError';
  }
}

/**
 * Thrown by `BatchClient.transcribe` when the job reaches a terminal state
 * other than `done` (i.e. `rejected`, `deleted` or `expired`).
 */
export class SpeechmaticsJobFailedError extends SpeechmaticsInternalError {
  jobId: string;
  status: JobFailedStatus;
  /** Job details at the time of failure, including any `errors`, if they could be retrieved */
  job?: JobDetails;

  constructor(jobId: string, status: JobFailedStatus, job?: JobDetails) {
    const reasons = job?.errors?.map((e) => e.message).join('; ');
    super(
      InternalErrorEnum.JobFailed,
      `Job ${jobId} finished with status '${status}'${reasons ? `: ${reasons}` : ''}`,
      job,
    );
    this.name = 'SpeechmaticsJobFailedError';
    this.jobId = jobId;
    this.status = status;
    this.job = job;
  }
}

export type SpeechmaticsError =
  | SpeechmaticsInternalError
  | SpeechmaticsResponseError;
