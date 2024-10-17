import { z } from 'zod';

import {
  type ErrorResponse,
  ErrorResponseErrorEnum,
} from '../models/error-response';

const ErrorResponseSchema: z.ZodType<ErrorResponse> = z.object({
  code: z.number(),
  detail: z.optional(z.string()),
  error: z.nativeEnum(ErrorResponseErrorEnum),
});

type SpeechamticsErrorEnum = InternalErrorEnum | ErrorResponseErrorEnum;
interface SpeechmaticsErrorInterface extends Error {
  error: SpeechamticsErrorEnum;
}

export class SpeechmaticsResponseError
  extends Error
  implements SpeechmaticsErrorInterface
{
  response: ErrorResponse;
  error: ErrorResponseErrorEnum;

  constructor(errorResponse: ErrorResponse | unknown) {
    const parse = ErrorResponseSchema.safeParse(errorResponse);
    if (parse.success) {
      super(parse.data.error);
      this.response = parse.data;
      this.error = parse.data.error;
      this.name = 'SpeechmaticsResponseError';
    } else {
      throw new SpeechmaticsUnexpectedResponse(undefined, errorResponse);
    }
  }
}

export const InternalErrorEnum = {
  ConfigurationError: 'Configuration error',
  NetworkError: 'Network error',
  UnsupportedEnvironment: 'Unsupported environment',
  UnexpectedMessage: 'Unexpected message',
  UnexpectedResponse: 'Unexpected response',
  InvalidTypeError: 'Invalid type error',
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

export type SpeechmaticsError =
  | SpeechmaticsInternalError
  | SpeechmaticsResponseError;
