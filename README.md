[![npm](https://img.shields.io/npm/v/speechmatics)](https://www.npmjs.com/package/speechmatics)

# Table of Contents

1. [Introduction](#speechmatics-javascript-sdk)
1. [Documentation](#documentation)
1. [Installation](#installation)
1. [Authentication](#authentication)
   1. [Bearer authentication](#bearer-authentication)
   1. [JWT authentication](#jwt-authentication)
1. [Running realtime transcription in Node.js](#running-realtime-transcription-in-nodejs)
1. [Running realtime transcription in browsers](#running-realtime-transcription-in-browsers)
1. [Transcription Configuration Options](#transcription-configuration-options)
1. [Examples](#examples)
1. [Node Example](#node-example)
1. [Contributing](#contributing)
1. [Feedback & Help](#feedback--help)

# Speechmatics Javascript SDK

Official JS/TS SDK for [Speechmatics](https://speechmatics.com) API.

To access the API you need to have an account with Speechmatics. You can sign up for a free trial [here](https://portal.speechmatics.com/signup).

## Documentation

The documentation for the API can be found [here](https://docs.speechmatics.com/).

More examples on how to use the SDK can be found in the [examples](./examples) folder.

Our Portal is also a good source of information on how to use the API. You can find it [here](https://portal.speechmatics.com/). Check out `Upload` and `Realtime Demo` sections.

## Installation

```bash
npm install speechmatics
```

## Authentication

In order to use the SDK, authentication is needed. Generate an API key in the [Portal](https://portal.speechmatics.com/). You can find more information on how to do that [here](https://docs.speechmatics.com/#authentication).

The section below explains the different options available for authenticating using your API key.

An API key can be used in 2 different ways for authentication:

1. Bearer authentication. It will be directly used by the SDK to generate the http `Authorization` header.
2. Obtaining a short-lived token (JWT).

### Bearer authentication

Bearer authentication will be used by the SDK if you pass an API key, as opposed to a JWT, when the SDK instance is created:

```typescript
import { RealtimeSession } from 'speechmatics';

const sm = new RealtimeSession(YOUR_API_KEY);
```

It is important to note in Browsers, or any client, you should never use `Bearer authentication` (option 1) as this exposes your API key which is NOT a short-lived token. The above example is meant for server-side Node code.

### JWT authentication

You can use your API key on the serverside to obtain a JWT for an authenticated user. These tokens are short-lived and won't be valid for authentication after they expire. A new JWT can be requested at any time. The http request for obtaining a JWT is as follows:

- Request type: `POST`
- Request URL: `https://mp.speechmatics.com/v1/api_keys`
- URL query parameter: `type` with possible values: `batch` or `rt`
- Headers: `Content-Type: application/json` and `Authorization: Bearer YOUR_API_KEY`
- Body: JSON encoded object with the field `ttl`. The value for ttl is a number that indicates for how many seconds the token will be valid. Between `60` and `3600`

Example of a request for a realtime JWT valid for 1 hour:

```bash
curl -L -X POST "https://mp.speechmatics.com/v1/api_keys?type=rt" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $YOUR_API_KEY" \
     -d '{"ttl": 3600}'
```

A valid JWT can then be passed to the `RealtimeSession` constructor:

```javascript
import { RealtimeSession } from 'speechmatics';

const session = new RealtimeSession(YOUR_JWT);
```

Alternatively:

```javascript
  const session = new RealtimeSession({apiKey: YOUR_JWT});
```

There is also the option to provide an async callback to fetch a JWT. This is useful if you want the SDK to refresh the JWT before it expires.

```typescript
const session = new RealtimeSession({
  apiKey: async () => {
    // ... implement your JWT fetching here
  },
});
```

## Running realtime transcription in Node.js

This examples shows you how to set up and run a realtime session on a Node.js backend server using a file as an input.

```typescript
import { RealtimeSession } from 'speechmatics';

// imports helpful for the file streaming
const fs = require('fs');
const path = require('path');

// init the session
const session = new RealtimeSession(YOUR_API_KEY);

//add listeners
session.addListener('RecognitionStarted', () => {
  console.log('RecognitionStarted');
});

session.addListener('Error', (error) => {
  console.log('session error', error);
});

session.addListener('AddTranscript', (message) => {
  console.log('AddTranscript', message);
});

session.addListener('AddPartialTranscript', (message) => {
  console.log('AddPartialTranscript', message);
});

session.addListener('EndOfTranscript', () => {
  console.log('EndOfTranscript');
});

//start session which is an async method
session.start().then(() => {
  //prepare file stream
  const fileStream = fs.createReadStream(
    path.join(__dirname, 'example_files/example.wav'),
  );

  //send it
  fileStream.on('data', (sample) => {
    console.log('sending audio', sample.length);
    session.sendAudio(sample);
  });

  //end the session
  fileStream.on('end', () => {
    session.stop();
  });
});
```

## Running realtime transcription in browsers

Because our API keys are persistent, it is important to remember not to use them to authenticate on the client side. Instead, we recommend generating a short-lived [JWT](#jwt-authentication) on the server side using your API key and providing this JWT as an argument to the RealtimeSession constructor:

```javascript
const session = new RealtimeSession(YOUR_JWT);
```

### Full Example

This examples shows you how to run the SDK in a web app using the in-built MediaRecorder browser class to access the computer's microphone devices.

```javascript
import { RealtimeSession } from 'speechmatics';

// create a session with JWT
const session = new RealtimeSession(YOUR_JWT);

//add listeners
session.addListener('RecognitionStarted', () => {
  console.log('RecognitionStarted');
});

session.addListener('Error', (error) => {
  console.log('session error', error);
});

session.addListener('AddTranscript', (message) => {
  console.log('AddTranscript', message);
});

session.addListener('AddPartialTranscript', (message) => {
  console.log('AddPartialTranscript', message);
});

session.addListener('EndOfTranscript', () => {
  console.log('EndOfTranscript');
});

//start session which is an async method
session.start().then(async () => {
  //setup audio stream
  let stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 16000
  });

  mediaRecorder.start(1000);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      session.sendAudio(event.data);
    }
  };
});
```


## Transcription Configuration Options

A [TranscriptionConfig](/src/types/models/realtime-transcription-config.ts) object specifies different configuration values that can be used for transcription. If a transcription config is not given, the SDK uses a default one with just the `language` field set to `en`.

A `TranscriptionConfig` object can be passed to the `start` method of `RealtimeSession` object.

```javascript
const session = new RealtimeSession(YOUR_API_KEY);

const transcription_config = {
  language: 'en',
  additional_vocab: [
    { content: 'gnocchi', sounds_like: ['nyohki', 'nokey', 'nochi'] },
    { content: 'CEO', sounds_like: ['C.E.O'] }
  ],
  diarization: 'speaker_change',
  enable_partials: true,
  operating_point: 'enhanced'
};

session.start({ transcription_config });
```

More information about the available fields can be found in the [documentation](https://docs.speechmatics.com/rt-api-ref#transcription-config).

## Examples

You can find more examples in the [examples](./examples) folder.



### Node Example

To run the node sample code you'll need to add your API key to a `.env` file or directly inside the node example file. You can generate your API key in the [Speechmatics Console](https://portal.speechmatics.com/manage-access/).

```bash
node examples/example_rt_node.js
```


## Contributing

We'd love to see your contributions! Please read our [contributing guidelines](./CONTRIBUTING.md) for more information.

## Feedback & Help

- For feature requests or bugs [open an issue](https://github.com/speechmatics/speechmatics-js-sdk/issues/new) 
- To provide direct feedback, email us at [devrel@speechmatics.com](mailto:devrel@speechmatics.com)
- We're [@speechmatics](https://twitter.com/Speechmatics) on Twitter too!
