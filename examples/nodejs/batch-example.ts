/**
 * This file showcases the batch-client package being used in NodeJS.
 *
 * It will connect to the batch API and transcribe a file.
 * To run this example, you will need to have a Speechmatics API key,
 * which can be generated from the Speechmatics Portal: https://portal.speechmatics.com/api-keys
 *
 * NOTE: This script is run as an ES Module via tsx, letting us use top-level await.
 * The library also works with CommonJS, but the code would need to be wrapped in an async function.
 */
import { BatchClient } from '@speechmatics/batch-client';
import { openAsBlob } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.SPEECHMATICS_API_KEY;
if (!apiKey) {
  throw new Error('Please set SPEECHMATICS_API_KEY in the .env file');
}

const client = new BatchClient({ apiKey, appId: 'nodeJS-example' });

console.log('Sending file for transcription...');

const blob = await openAsBlob('./example.wav');
const file = new File([blob], 'example.wav');

const response = await client.transcribe(
  // You can pass a File object...
  file,
  // ...or this:
  // { data: blob, fileName: 'example.wav' },
  // ...or this:
  // {
  //   url: 'https://github.com/speechmatics/speechmatics-js-sdk/raw/7e0083b830421541091730455f875be2a1984dc6/examples/nodejs/example.wav',
  // },
  {
    transcription_config: {
      language: 'en',
      model: 'enhanced',
    },
  },
  // Optional: format can be 'json-v2' (default), 'txt' or 'srt'.
  // An AbortSignal can be passed to stop waiting after some time.
  { format: 'json-v2', signal: AbortSignal.timeout(15 * 60 * 1000) },
);

console.log('Transcription finished!');

console.log(
  // With 'json-v2', the transcript is typed as a JSON object.
  // With 'txt' or 'srt', it is a string.
  response.results
    .map((r) => r.alternatives?.[0].content)
    .join(' '),
);
