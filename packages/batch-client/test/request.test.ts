import test from 'node:test';
import assert from 'node:assert';
import { request } from '../src/request';
import {
  SpeechmaticsResponseError,
  SpeechmaticsUnexpectedResponse,
} from '../src/errors';

async function withResponse(response: Response, fn: () => Promise<void>) {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => response) as typeof fetch;
  try {
    await fn();
  } finally {
    globalThis.fetch = original;
  }
}

const call = () =>
  request('key', 'https://asr.api.speechmatics.com', '/v2/jobs', 'GET');

test('request: JSON error body becomes SpeechmaticsResponseError', async () => {
  const body = { code: 404, error: 'Job not found' };
  await withResponse(new Response(JSON.stringify(body), { status: 404 }), () =>
    assert.rejects(call(), (err) => {
      assert(err instanceof SpeechmaticsResponseError);
      assert.deepStrictEqual(err.response, body);
      return true;
    }),
  );
});

test('request: non-JSON error body becomes SpeechmaticsUnexpectedResponse', async () => {
  const html = '<html><body>401 Authorization Required</body></html>';
  await withResponse(
    new Response(html, { status: 401, statusText: 'Unauthorized' }),
    () =>
      assert.rejects(call(), (err) => {
        assert(err instanceof SpeechmaticsUnexpectedResponse);
        assert.match(err.message, /HTTP 401 Unauthorized/);
        assert.deepStrictEqual(err.cause, {
          status: 401,
          statusText: 'Unauthorized',
          body: html,
        });
        return true;
      }),
  );
});

test('request: JSON error body with unexpected shape becomes SpeechmaticsUnexpectedResponse', async () => {
  await withResponse(
    new Response(JSON.stringify({ message: 'nope' }), { status: 502 }),
    () =>
      assert.rejects(call(), (err) => {
        assert(err instanceof SpeechmaticsUnexpectedResponse);
        assert.match(err.message, /HTTP 502/);
        return true;
      }),
  );
});

test('request: empty error body becomes SpeechmaticsUnexpectedResponse', async () => {
  await withResponse(new Response(null, { status: 503 }), () =>
    assert.rejects(call(), SpeechmaticsUnexpectedResponse),
  );
});
