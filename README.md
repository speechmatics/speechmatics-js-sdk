
<p align="center">
  <br/>
  <img src="./assets/logo.svg"/>
  <h1 align="center">Speechmatics JavaScript SDK</h1>
  <h3 align="center">Best-in-class speech technology for the web and beyond</h3>
  <p align="center">Packages are in the <a href="/packages"><code>packages/</code></a> directory &mdash; see <a href="/examples"><code>examples/</code></a> for working demos.</p>
</p>

## Packages

See the `README.md` in each package for installation and usage details.

### API clients

Official JS clients for Speechmatics APIs:

| Package | Description |
|---|---|
| [`@speechmatics/auth`](./packages/auth) | Fetch short-lived JWT tokens for use in the browser |
| [`@speechmatics/batch-client`](./packages/batch-client) | Upload files for asynchronous transcription |
| [`@speechmatics/real-time-client`](./packages/real-time-client) | Stream audio for real-time transcription via WebSocket |
| [`@speechmatics/flow-client`](./packages/flow-client) | Interact with the Flow voice-assistant API |

### Browser utilities

Helpers for audio capture and playback in the browser:

| Package | Description |
|---|---|
| [`@speechmatics/browser-audio-input`](./packages/browser-audio-input) | Enumerate audio devices and capture PCM audio via AudioWorklet |
| [`@speechmatics/web-pcm-player`](./packages/web-pcm-player) | Play back PCM audio (Int16 / Float32) in the browser |

### React hooks

React wrappers for the packages above:

| Package | Description |
|---|---|
| [`@speechmatics/real-time-client-react`](./packages/real-time-client-react) | Hooks and context for real-time transcription |
| [`@speechmatics/flow-client-react`](./packages/flow-client-react) | Hooks and context for the Flow API |
| [`@speechmatics/browser-audio-input-react`](./packages/browser-audio-input-react) | Hooks for audio device management and PCM recording |
| [`@speechmatics/web-pcm-player-react`](./packages/web-pcm-player-react) | Hooks for PCM audio playback |
| [`@speechmatics/use-flow-transcript`](./packages/use-flow-transcript) | Hook for rendering Flow conversation transcripts _(pre-release)_ |

## Supported JS runtimes

Our philosophy is to adhere to web-standard APIs as much as possible. We aim for our SDKs to work in:

- All modern browsers
- React Native
- Node.js (v22+)
- Deno
- Bun
- Cloudflare Workers / edge environments

If you encounter an issue in any of these environments, please [open an issue](https://github.com/speechmatics/speechmatics-js-sdk/issues/new).

## Authentication

You need a Speechmatics API key to use these packages. Generate one at [portal.speechmatics.com/api-keys](https://portal.speechmatics.com/api-keys).

For browser-based apps it is strongly recommended to use a short-lived JWT rather than exposing your API key. Use `@speechmatics/auth` on your backend to generate one:

```ts
import { createSpeechmaticsJWT } from '@speechmatics/auth';

const jwt = await createSpeechmaticsJWT({
  type: 'rt',          // 'batch' | 'rt' | 'flow' | 'tts'
  apiKey: process.env.SPEECHMATICS_API_KEY,
  ttl: 60,             // seconds
});
```

## Quick start

### Realtime transcription (browser / Node.js)

```ts
import { RealtimeClient } from '@speechmatics/real-time-client';

const client = new RealtimeClient();

client.addEventListener('receiveMessage', ({ data }) => {
  if (data.message === 'AddTranscript') {
    console.log(data.metadata.transcript);
  }
});

await client.start(JWT, { transcription_config: { language: 'en' } });
// pipe audio chunks to: client.sendAudio(audioBuffer)
await client.stop();
```

### Batch transcription

```ts
import { BatchClient } from '@speechmatics/batch-client';

const client = new BatchClient({ apiKey: process.env.SPEECHMATICS_API_KEY });
const job = await client.createJob({ data: audioFile, config: { type: 'transcription', transcription_config: { language: 'en' } } });
const transcript = await client.waitForCompletion(job.id);
```

### Flow (voice agent)

```ts
import { FlowClient } from '@speechmatics/flow-client';

const client = new FlowClient('wss://eu2.rt.speechmatics.com', { appId: 'my-app' });
await client.start(JWT, { persona_id: 'default' });
```

## Documentation

- [Speechmatics Documentation](https://docs.speechmatics.com/)
- [Realtime API reference](https://docs.speechmatics.com/rt-api-ref)
- [Batch API reference](https://docs.speechmatics.com/jobsapi)
- [Flow API getting started](https://docs.speechmatics.com/flow/getting-started)
- [Authentication guide](https://docs.speechmatics.com/introduction/authentication)
- [Portal](https://portal.speechmatics.com/) — Upload & Realtime Demo sections

More runnable examples are in the [`examples/`](./examples) folder:
- `examples/nextjs-real-time-transcription` — Next.js real-time transcription demo
- `examples/nextjs-flow` — Next.js Flow API integration
- `examples/nodejs` — Node.js batch & real-time examples
- `examples/react-native-flow` — React Native Flow integration

## Contributing

We'd love to see your contributions! Please read our [contributing guidelines](./CONTRIBUTING.md) for more information.

## Feedback & Help

- Feature requests or bugs: [open an issue](https://github.com/speechmatics/speechmatics-js-sdk/issues/new)
- Direct feedback: [devrel@speechmatics.com](mailto:devrel@speechmatics.com)
- Twitter/X: [@speechmatics](https://twitter.com/Speechmatics)
