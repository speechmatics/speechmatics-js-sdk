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

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('Please set API_KEY in the .env file');
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
      operating_point: 'enhanced',
    },
  },
  'json-v2',
);

console.log('Transcription finished!');

console.log(
  // Transcripts can be strings when the 'txt' format is chosen
  typeof response === 'string'
    ? response
    : response.results.map((r) => r.alternatives?.[0].content).join(' '),
);
