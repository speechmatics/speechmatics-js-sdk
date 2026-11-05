
# Speechmatics real-time client 🎤

Official JS client for the Speechmatics real-time transcription API.

API documentation can be found here: https://docs.speechmatics.com/rt-api-ref

## Installation

```
npm i @speechmatics/real-time-client
```

> [!WARNING]  
> For React Native, make sure to install the [`event-target-polyfill`](https://www.npmjs.com/package/event-target-polyfill) package, or any other polyfill for the [`EventTarget` class](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)

## Usage

More examples will be available soon. For now, you can checkout the [NodeJS example](/examples/nodejs/real-time-file-example.ts).

### API keys 🔑

You can generate a long-lived API key through our self service portal here: https://portal.speechmatics.com/api-keys

See our documentation about generating short-lived JWTs here: https://docs.speechmatics.com/introduction/authentication
### Multichannel audio 🎧

If you have separate audio streams per speaker (e.g. the two legs of a phone call), enable channel diarization and send each stream with `sendChannelAudio`. Transcripts will include a `channel` field identifying the source.

```typescript
import { RealtimeClient } from '@speechmatics/real-time-client';

const client = new RealtimeClient();

client.addEventListener('receiveMessage', ({ data }) => {
  if (data.message === 'AddTranscript') {
    console.log(`[${data.channel}]`, data.metadata.transcript);
  }
});

await client.start(jwt, {
  audio_format: { type: 'raw', encoding: 'mulaw', sample_rate: 8000 },
  transcription_config: {
    language: 'en',
    diarization: 'channel',
    channel_diarization_labels: ['agent', 'customer'],
  },
});

// Raw bytes (ArrayBuffer / Uint8Array / Buffer) or a base64-encoded string
client.sendChannelAudio('agent', agentChunk);
client.sendChannelAudio('customer', customerChunkBase64);

// Optionally end a single channel early, e.g. when one participant leaves
client.endChannel('customer');

// Ends any remaining channels and waits for the final transcript
await client.stopRecognition();
```
