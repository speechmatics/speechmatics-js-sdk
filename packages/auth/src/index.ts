export async function createSpeechmaticsJWT({
  type,
  apiKey,
  clientRef,
  ttl = 60,
  managementPlatformURL = 'https://mp.speechmatics.com/v1',
}: {
  type: 'batch' | 'rt' | 'flow';
  apiKey: string;
  clientRef?: string;
  ttl?: number;
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
    }),
  });
  if (!resp.ok) {
    throw new Error('Bad response from API', { cause: resp });
  }
  return (await resp.json()).key_value;
}
