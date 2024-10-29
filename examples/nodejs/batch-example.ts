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

(async () => {
  const blob = await openAsBlob('./example.wav');
  const file = new File([blob], 'example.wav');

  const response = await client.transcribe(
    file,
    {
      transcription_config: {
        language: 'en',
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
})();
