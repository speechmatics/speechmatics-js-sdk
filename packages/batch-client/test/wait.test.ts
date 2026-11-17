import test from 'node:test';
import assert from 'node:assert';
import { BatchClient } from '../src/client';
import {
  SpeechmaticsConfigurationError,
  SpeechmaticsJobFailedError,
} from '../src/errors';

type Handler = (url: URL, init?: RequestInit) => Response | Promise<Response>;

function mockFetch(handlers: Handler[]) {
  const calls: URL[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: string, init?: RequestInit) => {
    const url = new URL(input);
    calls.push(url);
    const handler = handlers.shift();
    if (!handler) throw new Error(`Unexpected request to ${url}`);
    return handler(url, init);
  }) as typeof fetch;
  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const client = new BatchClient({ apiKey: 'key', appId: 'test' });
const file = new File(['abc'], 'test.wav');
const config = { transcription_config: { language: 'en' } };
const transcript = { format: '2.9', results: [] };
const job = (status: string, extra = {}) =>
  json({ job: { id: 'j1', status, ...extra } });

test('createTranscriptionJob without wait sends no wait/format params', async () => {
  const m = mockFetch([() => json({ id: 'j1' }, 201)]);
  try {
    const res = await client.createTranscriptionJob(file, config);
    assert.deepStrictEqual(res, { id: 'j1' });
    assert.strictEqual(m.calls[0].searchParams.has('wait'), false);
    assert.strictEqual(m.calls[0].searchParams.has('format'), false);
  } finally {
    m.restore();
  }
});

test('createTranscriptionJob passes wait and format', async () => {
  const m = mockFetch([
    () => json({ id: 'j1', status: 'done', srt: '1' }, 201),
  ]);
  try {
    const res = await client.createTranscriptionJob(file, config, {
      wait: 30,
      format: 'srt',
    });
    assert.strictEqual(res.status, 'done');
    assert.strictEqual(m.calls[0].searchParams.get('wait'), '30');
    assert.strictEqual(m.calls[0].searchParams.get('format'), 'srt');
  } finally {
    m.restore();
  }
});

test('createTranscriptionJob with wait: 0 handles the id-only response', async () => {
  // The API currently treats wait=0 as if wait were omitted
  const m = mockFetch([() => json({ id: 'j1' }, 201)]);
  try {
    const res = await client.createTranscriptionJob(file, config, { wait: 0 });
    assert.strictEqual(m.calls[0].searchParams.get('wait'), '0');
    assert.strictEqual(res.status, undefined);
    assert.strictEqual(res.id, 'j1');
  } finally {
    m.restore();
  }
});

test('deleteJob passes force only when set', async () => {
  const m = mockFetch([
    () => json({ job: { id: 'j1' } }),
    () => json({ job: { id: 'j1' } }),
  ]);
  try {
    await client.deleteJob('j1');
    await client.deleteJob('j1', { force: true });
    assert.strictEqual(m.calls[0].searchParams.has('force'), false);
    assert.strictEqual(m.calls[1].searchParams.get('force'), 'true');
  } finally {
    m.restore();
  }
});

test('requests send Accept, not Content-Type', async () => {
  const headers: Headers[] = [];
  const capture = (res: () => Response) => (_url: URL, init?: RequestInit) => {
    headers.push(new Headers(init?.headers));
    return res();
  };
  const m = mockFetch([
    capture(() => json({ id: 'j1' }, 201)),
    capture(() => job('done')),
    capture(() => new Response('hello')),
    capture(() => json(transcript)),
  ]);
  try {
    await client.createTranscriptionJob(file, config);
    await client.getJob('j1');
    await client.getJobResult('j1', 'srt');
    await client.getJobResult('j1');
    assert.deepStrictEqual(
      headers.map((h) => [h.get('accept'), h.get('content-type')]),
      [
        ['application/json', null],
        ['application/json', null],
        ['text/plain', null],
        ['application/json', null],
      ],
    );
  } finally {
    m.restore();
  }
});

test('v5-style arguments throw a helpful error instead of being ignored', async () => {
  const m = mockFetch([]);
  // Casts simulate plain JS callers, who get no type errors
  // biome-ignore lint/suspicious/noExplicitAny: deliberately passing invalid arguments
  const anyClient = client as any;
  try {
    await assert.rejects(
      anyClient.transcribe(file, config, 'txt'),
      (err: Error) =>
        err instanceof SpeechmaticsConfigurationError &&
        /options object/.test(err.message),
    );
    await assert.rejects(
      anyClient.transcribe(file, config, { format: 'text' }),
      (err: Error) =>
        err instanceof SpeechmaticsConfigurationError &&
        /'txt'/.test(err.message),
    );
    await assert.rejects(
      anyClient.getJobResult('j1', 'text'),
      SpeechmaticsConfigurationError,
    );
    await assert.rejects(
      anyClient.deleteJob('j1', true),
      (err: Error) =>
        err instanceof SpeechmaticsConfigurationError &&
        /\{ force: true \}/.test(err.message),
    );
    assert.strictEqual(m.calls.length, 0, 'no requests should be sent');
  } finally {
    m.restore();
  }
});

test('invalid wait values are rejected', async () => {
  for (const wait of [-1, 1.5, Number.NaN]) {
    await assert.rejects(
      client.getJob('j1', { wait }),
      SpeechmaticsConfigurationError,
    );
  }
});

test('getJob and getJobResult pass wait only when given', async () => {
  const m = mockFetch([
    () => job('running'),
    () => job('running'),
    () => new Response('hello', { status: 200 }),
  ]);
  try {
    await client.getJob('j1');
    await client.getJob('j1', { wait: 0 });
    const text = await client.getJobResult('j1', 'txt', { wait: 5 });
    assert.strictEqual(text, 'hello');
    assert.strictEqual(m.calls[0].searchParams.has('wait'), false);
    assert.strictEqual(m.calls[1].searchParams.get('wait'), '0');
    assert.strictEqual(m.calls[2].searchParams.get('wait'), '5');
    assert.strictEqual(m.calls[2].searchParams.get('format'), 'txt');
  } finally {
    m.restore();
  }
});

test('transcribe: completes in a single request when transcript is embedded', async () => {
  const m = mockFetch([
    () => json({ id: 'j1', status: 'done', 'json-v2': transcript }, 201),
  ]);
  try {
    const res = await client.transcribe(file, config);
    assert.deepStrictEqual(res, transcript);
    assert.strictEqual(m.calls.length, 1);
    assert.strictEqual(m.calls[0].searchParams.get('wait'), '60');
    assert.strictEqual(m.calls[0].searchParams.get('format'), 'json-v2');
  } finally {
    m.restore();
  }
});

test('transcribe: fetches transcript when done but not embedded', async () => {
  const m = mockFetch([
    () => json({ id: 'j1', status: 'done' }, 201),
    () => new Response('hello', { status: 200 }),
  ]);
  try {
    const res = await client.transcribe(file, config, { format: 'txt' });
    assert.strictEqual(res, 'hello');
    assert.strictEqual(m.calls[1].pathname, '/v2/jobs/j1/transcript');
  } finally {
    m.restore();
  }
});

test('transcribe: keeps waiting on the job until terminal', async () => {
  const m = mockFetch([
    () => json({ id: 'j1', status: 'created' }, 201),
    () => job('running'),
    () => job('done'),
    () => json(transcript),
  ]);
  try {
    const res = await client.transcribe(file, config, { wait: 0 });
    assert.deepStrictEqual(res, transcript);
    assert.deepStrictEqual(
      m.calls.map((c) => [c.pathname, c.searchParams.get('wait')]),
      [
        ['/v2/jobs', '0'],
        ['/v2/jobs/j1', '0'],
        ['/v2/jobs/j1', '0'],
        ['/v2/jobs/j1/transcript', '0'],
      ],
    );
  } finally {
    m.restore();
  }
});

test('transcribe: falls back to polling when server ignores wait', async () => {
  const m = mockFetch([
    () => json({ id: 'j1' }, 201),
    () => job('done'),
    () => json(transcript),
  ]);
  try {
    assert.deepStrictEqual(await client.transcribe(file, config), transcript);
  } finally {
    m.restore();
  }
});

test('transcribe: throws SpeechmaticsJobFailedError on rejection', async () => {
  const errors = [{ timestamp: 't', message: 'bad audio' }];
  const m = mockFetch([
    () => json({ id: 'j1', status: 'rejected' }, 201),
    () => job('rejected', { errors }),
  ]);
  try {
    await assert.rejects(client.transcribe(file, config), (err) => {
      assert(err instanceof SpeechmaticsJobFailedError);
      assert.strictEqual(err.jobId, 'j1');
      assert.strictEqual(err.status, 'rejected');
      assert.deepStrictEqual(err.job?.errors, errors);
      assert.match(err.message, /bad audio/);
      return true;
    });
  } finally {
    m.restore();
  }
});

test('transcribe: throws when job fails while waiting', async () => {
  const m = mockFetch([
    () => json({ id: 'j1', status: 'created' }, 201),
    () => job('expired'),
  ]);
  try {
    await assert.rejects(
      client.transcribe(file, config),
      SpeechmaticsJobFailedError,
    );
    assert.strictEqual(m.calls.length, 2);
  } finally {
    m.restore();
  }
});

test('transcribe: can be aborted', async () => {
  const controller = new AbortController();
  const m = mockFetch([
    () => json({ id: 'j1', status: 'created' }, 201),
    () => {
      controller.abort(new Error('stop'));
      return job('running');
    },
  ]);
  try {
    await assert.rejects(
      client.transcribe(file, config, { signal: controller.signal }),
      /stop/,
    );
  } finally {
    m.restore();
  }
});
