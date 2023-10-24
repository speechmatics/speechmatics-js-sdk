import z from 'zod';

import { ErrorResponse, ErrorResponseErrorEnum } from '../types';

const ErrorResponseSchema: z.ZodType<ErrorResponse> = z.object({
  code: z.number(),
  detail: z.optional(z.string()),
  error: z.nativeEnum(ErrorResponseErrorEnum),
});

export class SpeechmaticsResponseError extends Error {
  response: ErrorResponse;

  constructor(errorResponse: unknown) {
    const parse = ErrorResponseSchema.safeParse(errorResponse);
    if (parse.success) {
      super(parse.data.error);
      this.response = parse.data;
    } else {
      throw new SpeechmaticsInternalError('Unexpected response');
    }
  }
}

export const InternalErrorEnum = {
  ProcessUndefined: 'process is undefined - are you running in node?',
  WindowUndefined: 'window is undefined - are you running in a browser?',
  ApiKeyUndefined: 'Error: apiKey is undefined',
  FetchSLT: 'Error fetching short lived token',
  UnsuportedEnvironment: 'Unsupported environment',
  UnexpectedMessage: 'Unexpected message',
  UnexpectedResponse: 'Unexpected response',
  TypeError: 'Unexpected type',
} as const;

export type InternalErrorEnum =
  typeof InternalErrorEnum[keyof typeof InternalErrorEnum];

export class SpeechmaticsInternalError extends Error {
  error: InternalErrorEnum;
  detail?: string;
  cause?: unknown;

  constructor(error: InternalErrorEnum, detail?: string, cause?: unknown) {
    super();
    this.error = error;
    this.detail = detail;
    this.cause = cause;
  }
}

export type SpeechmaticsError =
  | SpeechmaticsInternalError
  | SpeechmaticsResponseError;
