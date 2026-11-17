/**
 * Live tests against the real Speechmatics Batch API.
 *
 * These submit real (short) jobs and so use account credit. They are NOT run by `pnpm test`.
 * Run manually with:
 *
 *   SPEECHMATICS_API_KEY=... pnpm --filter @speechmatics/batch-client test:live
 *
 * Optionally set SPEECHMATICS_BATCH_URL to target a different region/environment.
 */
import test from 'node:test';
import assert from 'node:assert';
import { openAsBlob } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BatchClient } from '../src/client';
import {
  SpeechmaticsJobFailedError,
  SpeechmaticsResponseError,
} from '../src/errors';
import { ErrorResponseErrorEnum } from '../models/error-response';

const apiKey = process.env.SPEECHMATICS_API_KEY;
if (!apiKey) {
  throw new Error('SPEECHMATICS_API_KEY must be set to run live tests');
}

const client = new BatchClient({
  apiKey,
  apiUrl: process.env.SPEECHMATICS_BATCH_URL,
  appId: 'js-sdk-live-test',
});

const audioPath = fileURLToPath(
  new URL('../../../examples/nodejs/example.wav', import.meta.url),
);
const loadAudio = async () =>
  new File([await openAsBlob(audioPath)], 'example.wav');

const config = {
  transcription_config: { language: 'en' },
  // Makes test jobs easy to identify in the jobs list
  tracking: { title: 'JS SDK live test', tags: ['js-sdk-live-test'] },
};

// Upper bound for any single test, so a stuck job can't hang CI
const TEST_TIMEOUT_MS = 5 * 60 * 1000;

test(
  'transcribe returns a json-v2 transcript',
  { timeout: TEST_TIMEOUT_MS },
  async () => {
    const transcript = await client.transcribe(await loadAudio(), config);
    assert.ok(transcript.results.length > 0, 'expected some results');
    assert.ok(
      transcript.results.some((r) => r.type === 'word'),
      'expected at least one word',
    );
  },
);

test(
  'transcribe returns a txt transcript',
  { timeout: TEST_TIMEOUT_MS },
  async () => {
    const text = await client.transcribe(await loadAudio(), config, {
      format: 'txt',
    });
    assert.strictEqual(typeof text, 'string');
    assert.ok(text.trim().length > 0, 'expected non-empty text');
  },
);

test(
  'lower-level wait flow: create, getJob, getJobResult',
  { timeout: TEST_TIMEOUT_MS },
  async () => {
    // wait: 0 opts in to the extended response without blocking
    const created = await client.createTranscriptionJob(
      await loadAudio(),
      config,
      {
        wait: 0,
        format: 'srt',
      },
    );
    assert.ok(created.id);
    assert.ok(
      ['created', 'done'].includes(created.status),
      `unexpected status ${created.status}`,
    );

    try {
      const { job } = await client.getJob(created.id, { wait: 0 });
      assert.strictEqual(job.id, created.id);

      let srt: string | undefined;
      for (let attempt = 0; attempt < 10 && srt === undefined; attempt++) {
        try {
          srt = await client.getJobResult(created.id, 'srt', { wait: 30 });
        } catch (err) {
          if (
            err instanceof SpeechmaticsResponseError &&
            err.error === ErrorResponseErrorEnum.TranscriptionNotReady
          ) {
            continue;
          }
          throw err;
        }
      }
      assert.ok(srt?.includes('-->'), 'expected SRT timestamps');
    } finally {
      await client.deleteJob(created.id, true).catch(() => {});
    }
  },
);

test(
  'transcribe fails cleanly for invalid audio',
  { timeout: TEST_TIMEOUT_MS },
  async () => {
    const notAudio = new File(['this is not audio'], 'not-audio.wav');
    await assert.rejects(client.transcribe(notAudio, config), (err) => {
      // Depending on where validation happens, this is either rejected
      // up front (HTTP 400) or accepted and then rejected by the job
      if (err instanceof SpeechmaticsJobFailedError) {
        assert.strictEqual(err.status, 'rejected');
        return true;
      }
      return err instanceof SpeechmaticsResponseError;
    });
  },
);
