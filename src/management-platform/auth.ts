import { SpeechmaticsNetworkError } from '../utils/errors';
import { request } from '../utils/request';

export default async function getShortLivedToken(
  type: 'batch' | 'rt',
  apiKey: string,
  mpApiUrl: string,
  ttl?: number,
) {
  if (typeof window !== 'undefined') {
    console.warn(
      'Requesting a short lived token from a browser is not recommended. \
    More info at https://github.com/speechmatics/speechmatics-js#readme',
    );
  }
  const jsonResponse = await request<{ key_value: string }>(
    apiKey,
    mpApiUrl,
    `v1/api_keys?type=${type}`,
    'POST',
    JSON.stringify({
      ttl: ttl || 60,
    }),
    undefined,
    'application/json',
  ).catch((err) => {
    throw new SpeechmaticsNetworkError('Error fetching short lived token', err);
  });
  return jsonResponse.key_value;
}
