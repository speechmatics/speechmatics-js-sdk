export async function fetchCredentials() {
  const resp = await fetch(
    'https://mp.speechmatics.com/v1/api_keys?type=flow',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify({
        ttl: 3600,
      }),
    },
  );
  if (!resp.ok) {
    throw new Error('Bad response from API', { cause: resp });
  }
  return await resp.json();
}
