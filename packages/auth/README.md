# Speechmatics authentication 🔑

Library for managing authentication with Speechmatics APIs

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

```sh
npm i @speechmatics/auth
```

## Usage

```typescript
import { RealtimeClient } from '@speechmatics/real-time-client';
import { createSpeechmaticsJWT } from '@speechmatics/auth';

const client = new RealtimeClient();

client.addEventListener('receiveMessage', ({ data }) => {
  // Handle transcription messages
});

async function transcribeFileRealtime () {
  const jwt = await createSpeechmaticsJWT({
    type: 'rt',
    apiKey,
    ttl: 60, // 1 minute
  });

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
}

transcribeFileRealtime();
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.