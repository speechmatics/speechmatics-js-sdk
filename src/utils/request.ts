import {
  SpeechmaticsInvalidTypeError,
  SpeechmaticsResponseError,
} from './errors';

export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

export type QueryParams<K extends string = string> = Partial<
  Record<K, string | number | boolean>
>;

export async function request<T, K extends string = string>(
  apiKey: string,
  url: string,
  path: string,
  method: HttpMethod = 'POST',
  payload?: BodyInit | null | undefined,
  params?: QueryParams<K>,
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

  const response = await fetch(fullUrl, requestOptions);

  if (!response.ok) {
    const responseJson = await response.json();
    throw new SpeechmaticsResponseError(responseJson);
  }

  const isPlain = contentType === 'text/plain';

  let result: T;
  try {
    if (isPlain) {
      result = (await response.text()) as T;
    } else {
      result = (await response.json()) as T;
    }
  } catch (error) {
    throw new SpeechmaticsInvalidTypeError(`Cannot parse error:\n\n${error}`);
  }

  return result;
}

export const SM_SDK_PARAM_NAME = 'sm-sdk';
export const SM_APP_PARAM_NAME = 'sm-app';

export function getSmSDKVersion(): string {
  return `js-${SDK_VERSION}`;
}

export function addQueryParamsToUrl<K extends string>(
  url: string,
  queryParams: QueryParams<K>,
): string {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);
  Object.keys(queryParams).forEach((key) => {
    const value = queryParams[key as K];
    if (value !== undefined) params.append(key, `${value}`);
  });
  parsedUrl.search = params.toString();
  return parsedUrl.href;
}

export function addSDKInfoToRequestUrl(url: string): string {
  return addQueryParamsToUrl(url, { [SM_SDK_PARAM_NAME]: getSmSDKVersion() });
}
