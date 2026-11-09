
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

If you have a separate audio stream per speaker (e.g. the two sides of a phone call), enable channel diarization and send each stream with `sendChannelAudio()`. See the [multichannel NodeJS example](/examples/nodejs/real-time-multichannel-example.ts).
