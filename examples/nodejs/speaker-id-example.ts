/**
 * This file showcases the speaker ID feature of the real-time-client package being used in NodeJS.
 *
 * It will connect to the real-time API and transcribe a file in real-time, then return the speakers.
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

const apiKey = process.env.SPEECHMATICS_API_KEY;
if (!apiKey) {
  throw new Error('Please set the SPEECHMATICS_API_KEY environment variable');
}

const client = new RealtimeClient();

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
    operating_point: 'enhanced',
    diarization: "speaker",
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

// We wait for the speakers to be available.
// With final = true, the speakers are only returned when the session is finished
const speakers = await client.getSpeakers({ final: true, timeout: 10000 });
console.log(speakers);
