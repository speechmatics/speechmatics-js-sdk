import test from 'node:test';
import { getFullURL } from '../src/request';
import assert from 'node:assert';
import { BatchClient } from '../src/client';

test('getFullURL', async (t) => {
  const defaultURL = getFullURL('/v2/jobs', 'https://asr.api.speechmatics.com');
  assert(
    defaultURL ===
      'https://asr.api.speechmatics.com/v2/jobs?sm-sdk=js-0.0.0-test',
  );

  const withParams = getFullURL(
    '/v2/jobs',
    'https://asr.api.speechmatics.com',
    {
      'some-param': 'test',
    },
  );
  assert(
    withParams ===
      'https://asr.api.speechmatics.com/v2/jobs?sm-sdk=js-0.0.0-test&some-param=test',
  );

  const customSubpathURL = getFullURL(
    '/v2/jobs',
    'https://gateway.com/speechmatics',
  );
  assert(
    customSubpathURL ===
      'https://gateway.com/speechmatics/v2/jobs?sm-sdk=js-0.0.0-test',
  );
});

test('X-SM-Processing-Data header', async (t) => {
  const originalFetch = globalThis.fetch;

  let capturedHeaders: Record<string, string> = {};
  globalThis.fetch = (async (_url: string, opts: RequestInit) => {
    capturedHeaders = opts.headers as Record<string, string>;
    return new Response(JSON.stringify({ id: 'job-1' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  const client = new BatchClient({ apiKey: 'key', appId: 'test' });

  await client.createTranscriptionJob(
    { url: 'http://example.com/audio.wav' },
    { transcription_config: { language: 'en' } },
    { parallelEngines: 2, userId: 'user-123' },
  );
  assert.strictEqual(
    capturedHeaders['X-SM-Processing-Data'],
    JSON.stringify({ parallel_engines: 2, user_id: 'user-123' }),
  );

  capturedHeaders = {};
  await client.createTranscriptionJob(
    { url: 'http://example.com/audio.wav' },
    { transcription_config: { language: 'en' } },
  );
  assert.ok(!('X-SM-Processing-Data' in capturedHeaders));

  globalThis.fetch = originalFetch;
});
