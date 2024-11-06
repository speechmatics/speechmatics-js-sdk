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
    throw new Error(
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
  if (!resp.ok) {
    throw new Error('Bad response from API', { cause: resp });
  }
  return (await resp.json()).key_value;
}
