// See documentation at https://docs.speechmatics.com/introduction/authentication#temporary-key-configuration
export async function createSpeechmaticsJWT({
  type,
  apiKey,
  clientRef,
  ttl = 60,
  managementPlatformURL = 'https://mp.speechmatics.com/v1',
  region = 'eu',
}: {
  type: 'batch' | 'rt' | 'flow';
  apiKey: string;
  clientRef?: string;
  ttl?: number;
  region?: 'eu' | 'usa' | 'au';
  managementPlatformURL?: string;
}): Promise<string> {
  if (type === 'batch' && !clientRef) {
    throw new SpeechmaticsJWTError(
      'ValidationFailed',
      'Must set the `client_ref` parameter when using temporary keys for batch transcription. See documentation at https://docs.speechmatics.com/introduction/authentication#batch-transcription',
    );
  }

  const resp = await fetch(`${managementPlatformURL}/api_keys?type=${type}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      ttl,
      region,
      client_ref: clientRef,
    }),
  });

  if (resp.ok) {
    return (await resp.json()).key_value;
  }

  // Handle errors
  if (resp.status === 403) {
    throw new SpeechmaticsJWTError('Unauthorized', 'unauthorized');
  }

  let json: { code: string; message: string };

  try {
    json = await resp.json();
  } catch (e) {
    throw new SpeechmaticsJWTError(
      'UnknownError',
      'Failed to parse JSON response',
      { cause: e },
    );
  }

  if (resp.status === 422) {
    throw new SpeechmaticsJWTError('ValidationFailed', json.message, {
      cause: json,
    });
  }

  throw new SpeechmaticsJWTError(
    'UnknownError',
    `Got response with status ${resp.status}`,
  );
}

export type SpeechmaticsJWTErrorType =
  | 'ValidationFailed'
  | 'Unauthorized'
  | 'UnknownError';

export class SpeechmaticsJWTError extends Error {
  constructor(
    readonly type: SpeechmaticsJWTErrorType,
    message: string,
    opts?: ErrorOptions,
  ) {
    super(message, opts);
    this.name = 'SpeechmaticsJWTError';
  }
}
