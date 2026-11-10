# Speechmatics batch client 💬

Official JS client for the Speechmatics batch jobs API.

API documentation can be found here: https://docs.speechmatics.com/jobsapi#tag/jobs

## Installation

```
npm i @speechmatics/batch-client
```

## Usage

More examples will be available soon. For now, you can checkout the [NodeJS example](/examples/nodejs/batch-example.ts).

This package exports a `BatchClient` class which can be used to call the batch job API endpoints.

### Transcribing a file

`transcribe` creates a job and resolves with the transcript once it's done:

```typescript
import { BatchClient } from '@speechmatics/batch-client';

const client = new BatchClient({ apiKey, appId: 'my-app' });

const transcript = await client.transcribe(
  file, // A File, { data: Blob, fileName: string }, or { url: string }
  { transcription_config: { language: 'en' } },
  {
    format: 'txt', // 'json-v2' (default), 'txt' or 'srt'
    signal: AbortSignal.timeout(15 * 60_000), // optional: stop waiting after 15 minutes
  },
);
```

`transcribe` uses the API's [synchronous `wait` option](https://docs.speechmatics.com/speech-to-text/batch/synchronous). Short files usually complete in one request. Longer jobs keep waiting on the job status until it's finished. Each request waits up to 60 seconds by default. You can change this with the `wait` option (in seconds). For example, lower it if a proxy closes idle connections sooner.

If the job is rejected, deleted or expires, `transcribe` throws a `SpeechmaticsJobFailedError` with the job's `errors`. Aborting with the signal only stops the client from waiting. The job keeps running on the server.

### Lower-level control with `wait`

The `wait` option (in seconds) is available on each endpoint that supports it:

```typescript
// Create a job and wait up to 30s for it to finish
const job = await client.createTranscriptionJob(file, config, {
  wait: 30,
  format: 'srt',
});

if (job.status === 'done') {
  // Embedded transcript (best-effort: may be absent, in which case use getJobResult)
  console.log(job.srt);
} else if (job.status === 'created') {
  // Still running. Wait up to another 30s for the job to finish...
  const { job: details } = await client.getJob(job.id, { wait: 30 });
  // ...or for the transcript to be ready (throws a 'Transcription not ready' error if it isn't)
  const srt = await client.getJobResult(job.id, 'srt', { wait: 30 });
}
```

Without `wait`, `createTranscriptionJob` returns as soon as the job is created. Note that when `wait` is omitted, `getJob` and `getJobResult` use a short wait that the server chooses. Pass `wait: 0` to return immediately.

All of these methods also accept an AbortSignal through the `signal` option.

### API keys 🔑

Note that the `apiKey` field of the `BatchClient` may be either a long lived API key, or a short-lived JWT.

If it is a short-lived JWT, the developer is responsible for making sure the key is valid.

You can generate a long-lived API key through our self service portal here: https://portal.speechmatics.com/api-keys

See our documentation about generating short-lived JWTs here: https://docs.speechmatics.com/introduction/authentication