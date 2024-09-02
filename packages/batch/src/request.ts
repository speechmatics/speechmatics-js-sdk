import {
  SpeechmaticsInvalidTypeError,
  SpeechmaticsNetworkError,
  SpeechmaticsResponseError,
} from './errors';

export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

export type QueryParams = Readonly<
  Record<string, string | number | boolean | undefined>
>;

export async function request<T>(
  apiKey: string,
  url: string,
  path: string,
  method: HttpMethod = 'POST',
  payload?: BodyInit | null | undefined,
  params?: QueryParams,
  contentType?: string,
): Promise<T> {
  const requestOptions: RequestInit = {
    method,
    headers: {
      ...(contentType ? { 'Content-Type': contentType } : {}),
      Authorization: `Bearer ${apiKey}`,
    },
    body: payload,
  };

  // Add sdk information as url query parameter
  const parsedUrl = new URL(path, url);
  let fullUrl = addSDKInfoToRequestUrl(parsedUrl.href);
  if (params) {
    fullUrl = addQueryParamsToUrl(fullUrl, params);
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, requestOptions);
  } catch (err) {
    throw new SpeechmaticsNetworkError(`Error fetching from ${path}`, err);
  }

  if (!response.ok) {
    const responseJson = await response.json();
    throw new SpeechmaticsResponseError(responseJson);
  }

  const isPlain = contentType === 'text/plain';

  let result: T;

  if (isPlain) {
    try {
      result = (await response.text()) as T;
    } catch (err) {
      throw new SpeechmaticsInvalidTypeError(
        'Failed to parse response text',
        err,
      );
    }
  } else {
    try {
      result = (await response.json()) as T;
    } catch (err) {
      throw new SpeechmaticsInvalidTypeError(
        'Failed to parse response JSON',
        err,
      );
    }
  }

  return result;
}

export const SM_SDK_PARAM_NAME = 'sm-sdk';
export const SM_APP_PARAM_NAME = 'sm-app';

// This is templated by the build process
declare const SDK_VERSION: string;

export function getSmSDKVersion(): string {
  return `js-${SDK_VERSION}`;
}

export function addQueryParamsToUrl(
  url: string,
  queryParams: QueryParams,
): string {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);

  for (const key of Object.keys(queryParams)) {
    const value = queryParams[key];
    if (value !== undefined) params.append(key, `${value}`);
  }

  parsedUrl.search = params.toString();
  return parsedUrl.href;
}

export function addSDKInfoToRequestUrl(url: string): string {
  return addQueryParamsToUrl(url, { [SM_SDK_PARAM_NAME]: getSmSDKVersion() });
}
