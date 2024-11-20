import { test } from 'node:test';
import assert from 'node:assert';
import { createSpeechmaticsJWT } from '../src';
import { jwtDecode } from 'jwt-decode';

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const apiKey = process.env.API_KEY!;

test('Request valid JWT', async (t) => {
  for (const type of ['batch', 'rt', 'flow'] as const) {
    const ttl = 60;
    const jwt = await createSpeechmaticsJWT({
      type,
      ttl,
      apiKey,
      clientRef: 'test',
    });
    const decoded = jwtDecode(jwt);
    assert(
      typeof decoded.exp === 'number' &&
        typeof decoded.iat === 'number' &&
        decoded.exp - decoded.iat === ttl,
    );
  }
});

test('Request too short TTL', async () => {
  for (const type of ['batch', 'rt', 'flow'] as const) {
    const ttl = 30;

    assert.rejects(
      createSpeechmaticsJWT({
        type,
        ttl,
        apiKey,
        clientRef: 'test',
      }),
      {
        name: 'SpeechmaticsJWTError',
        type: 'ValidationFailed',
        message: 'ttl in body should be greater than or equal to 60',
      },
    );
  }
});
