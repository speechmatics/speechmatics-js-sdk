/**
 * This file showcases the real-time-client package transcribing multichannel audio in NodeJS.
 *
 * It reads a stereo WAV file where each channel is a different speaker (like the two sides of a phone call),
 * and sends each channel to the real-time API separately, so every transcript is labelled with its channel.
 * Audio is sent at real-time pace to simulate a live call.
 *
 * To run this example, you will need to have a Speechmatics API key,
 * which can be generated from the Speechmatics Portal: https://portal.speechmatics.com/api-keys
 *
 * NOTE: This script is run as an ES Module via tsx, letting us use top-level await.
 * The library also works with CommonJS, but the code would need to be wrapped in an async function.
 */
import { RealtimeClient } from '@speechmatics/real-time-client';
import fs from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import dotenv from 'dotenv';
import { createSpeechmaticsJWT } from '@speechmatics/auth';

dotenv.config();

const apiKey = process.env.SPEECHMATICS_API_KEY;
if (!apiKey) {
  throw new Error('Please set the SPEECHMATICS_API_KEY environment variable');
}

// One label per channel in the file, in channel order. Labels must be unique.
const CHANNELS = ['agent', 'customer'];
const CHUNK_MS = 100;

const wav = readWav('./example-stereo.wav');
if (wav.numChannels !== CHANNELS.length) {
  throw new Error(
    `Expected ${CHANNELS.length} channels, file has ${wav.numChannels}`,
  );
}

const client = new RealtimeClient();

client.addEventListener('receiveMessage', ({ data }) => {
  if (data.message === 'AddTranscript' && data.metadata.transcript) {
    console.log(`[${data.channel}] ${data.metadata.transcript}`);
  } else if (data.message === 'Error') {
    console.error('Error from server:', data);
  }
});

const jwt = await createSpeechmaticsJWT({
  type: 'rt',
  apiKey,
  ttl: 60, // 1 minute
});

await client.start(jwt, {
  audio_format: {
    type: 'raw',
    encoding: 'pcm_s16le',
    sample_rate: wav.sampleRate,
  },
  transcription_config: {
    language: 'en',
    model: 'enhanced',
    // Transcribe each channel separately, labelling results with the channel name
    diarization: 'channel',
    channel_diarization_labels: CHANNELS,
  },
});

// WAV data is interleaved (L R L R ...), so split each chunk into one buffer per channel
const bytesPerFrame = 2 * wav.numChannels; // 16-bit samples
const framesPerChunk = (wav.sampleRate * CHUNK_MS) / 1000;
const totalFrames = wav.data.length / bytesPerFrame;

for (let start = 0; start < totalFrames; start += framesPerChunk) {
  const frames = Math.min(framesPerChunk, totalFrames - start);

  CHANNELS.forEach((channel, channelIndex) => {
    const chunk = Buffer.alloc(frames * 2);
    for (let i = 0; i < frames; i++) {
      const offset = (start + i) * bytesPerFrame + channelIndex * 2;
      wav.data.copy(chunk, i * 2, offset, offset + 2);
    }
    client.sendChannelAudio(channel, chunk);
  });

  await sleep(CHUNK_MS);
}

// Ends every channel, then waits for the final transcripts
await client.stopRecognition();

/** Minimal parser for 16-bit PCM WAV files */
function readWav(path: string) {
  const file = fs.readFileSync(path);
  let numChannels: number | undefined;
  let sampleRate: number | undefined;

  // Walk the RIFF chunks, skipping the 12 byte "RIFF....WAVE" header
  let offset = 12;
  while (offset + 8 <= file.length) {
    const id = file.toString('ascii', offset, offset + 4);
    const size = file.readUInt32LE(offset + 4);
    const body = offset + 8;

    if (id === 'fmt ') {
      const format = file.readUInt16LE(body);
      const bitsPerSample = file.readUInt16LE(body + 14);
      if (format !== 1 || bitsPerSample !== 16) {
        throw new Error('Only 16-bit PCM WAV files are supported');
      }
      numChannels = file.readUInt16LE(body + 2);
      sampleRate = file.readUInt32LE(body + 4);
    } else if (id === 'data') {
      if (!numChannels || !sampleRate) {
        throw new Error('WAV file is missing a fmt chunk');
      }
      return {
        numChannels,
        sampleRate,
        data: file.subarray(body, body + size),
      };
    }

    offset = body + size + (size % 2); // chunks are padded to even sizes
  }
  throw new Error('WAV file has no data chunk');
}
