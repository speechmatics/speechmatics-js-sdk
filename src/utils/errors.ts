import z from 'zod';

import { ErrorResponse, ErrorResponseErrorEnum } from '../types';

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
    } else {
      throw new SpeechmaticsUnexpectedResponse(undefined, errorResponse);
    }
  }
}

export const InternalErrorEnum = {
  ConfigurationError: 'Configuration error',
  NetworkError: 'Network error',
  UnsuportedEnvironment: 'Unsupported environment',
  UnexpectedMessage: 'Unexpected message',
  UnexpectedResponse: 'Unexpected response',
  TypeError: 'Type error', // TODO: this is used when code that should be unreachable is executed, which signifies there may be an issue with our types. Is there a better name?
} as const;

export type InternalErrorEnum =
  typeof InternalErrorEnum[keyof typeof InternalErrorEnum];

class SpeechmaticsInternalError extends Error {
  error: InternalErrorEnum;
  cause?: unknown; // e.g. a caught error or response

  constructor(error: InternalErrorEnum, message?: string, cause?: unknown) {
    super(message ?? error);
    this.error = error;
    this.cause = cause;
  }
}

export class SpeechmaticsConfigurationError extends SpeechmaticsInternalError {
  constructor(message?: string) {
    super(InternalErrorEnum.ConfigurationError, message);
  }
}
export class SpeechmaticsNetworkError extends SpeechmaticsInternalError {
  constructor(message?: string, cause?: unknown) {
    super(InternalErrorEnum.NetworkError, message, cause);
  }
}
export class SpeechmaticsUnsuportedEnvironment extends SpeechmaticsInternalError {
  constructor(message?: string) {
    super(InternalErrorEnum.UnsuportedEnvironment, message);
  }
}
export class SpeechmaticsUnexpectedMessage extends SpeechmaticsInternalError {
  constructor(message?: string) {
    super(InternalErrorEnum.UnexpectedMessage, message);
  }
}
export class SpeechmaticsUnexpectedResponse extends SpeechmaticsInternalError {
  constructor(message?: string, response?: unknown) {
    super(InternalErrorEnum.UnexpectedResponse, message, response);
  }
}
export class SpeechmaticsTypeError extends SpeechmaticsInternalError {
  constructor(message?: string) {
    super(InternalErrorEnum.TypeError, message);
  }
}

export type SpeechmaticsError =
  | SpeechmaticsInternalError
  | SpeechmaticsResponseError;
