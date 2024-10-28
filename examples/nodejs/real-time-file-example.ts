import { RealtimeClient } from '@speechmatics/real-time-client';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const client = new RealtimeClient();

async function fetchJWT(): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('Please set API_KEY in .env file');
  }
  const resp = await fetch('https://mp.speechmatics.com/v1/api_keys?type=rt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
    body: JSON.stringify({
      ttl: 3600,
    }),
  });
  if (!resp.ok) {
    throw new Error('Bad response from API', { cause: resp });
  }
  return (await resp.json()).key_value;
}

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

(async () => {
  const jwt = await fetchJWT();

  const fileStream = fs.createReadStream(
    path.join(__dirname, './example.wav'),
    {
      highWaterMark: 4096, //avoid sending faster than realtime
    },
  );

  await client.start(jwt, {
    transcription_config: {
      language: 'en',
      enable_partials: true,
    },
  });

  //send it
  fileStream.on('data', (sample) => {
    client.sendAudio(sample);
  });

  //end the session
  fileStream.on('end', () => {
    client.stopRecognition();
  });
})();
