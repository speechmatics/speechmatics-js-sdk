/**
 * This file showcases the real-time-client package being used in NodeJS.
 *
 * It will connect to the real-time API and transcribe a file in real-time.
 * To run this example, you will need to have a Speechmatics API key,
 * which can be generated from the Speechmatics Portal: https://portal.speechmatics.com/api-keys
 *
 * NOTE: This script is run as an ES Module via tsx, letting us use top-level await.
 * The library also works with CommonJS, but the code would need to be wrapped in an async function.
 */
import { RealtimeClient } from '@speechmatics/real-time-client';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { createSpeechmaticsJWT } from '@speechmatics/auth';

dotenv.config();

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('Please set the API_KEY environment variable');
}

const client = new RealtimeClient();

let finalText = '';

client.addEventListener('receiveMessage', ({ data }) => {
  if (data.message === 'AddPartialTranscript') {
    const partialText = data.results
      .map((r) => r.alternatives?.[0].content)
      .join(' ');
    process.stdout.write(`\r${finalText} \x1b[3m${partialText}\x1b[0m`);
  } else if (data.message === 'AddTranscript') {
    const text = data.results.map((r) => r.alternatives?.[0].content).join(' ');
    finalText += text;
    process.stdout.write(`\r${finalText}`);
  } else if (data.message === 'EndOfTranscript') {
    process.stdout.write('\n');
    process.exit(0);
  }
});

const jwt = await createSpeechmaticsJWT({
  type: 'rt',
  apiKey,
  ttl: 60, // 1 minute
});

const fileStream = fs.createReadStream('./example.wav', {
  highWaterMark: 4096, // avoid sending too much data at once
});

await client.start(jwt, {
  transcription_config: {
    language: 'en',
    enable_partials: true,
    operating_point: 'enhanced',
  },
});

//send it
fileStream.on('data', (sample) => {
  client.sendAudio(sample);
});

//end the session
fileStream.on('end', () => {
  // Send a stop message to the server when we're done sending audio.
  // We set `noTimeout` because we are streaming faster than real-time,
  // so we should wait for all the data to be processed before closing the connection.
  client.stopRecognition({ noTimeout: true });
});
