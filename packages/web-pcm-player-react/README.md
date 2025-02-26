# Web PCM player (React)

React bindings for the `@speechmatics/web-pcm-player` package.

# Installation

```
npm i @speechmatics/web-pcm-player-react
```

# Usage

This library can be used to play PCM data from either an:
  - `Int16Array` for 16-bit unsigned integer PCM or
  - `Float32Array`. for 32-bit float PCM

These formats correspond to `pcm_s16le` and `pcm_f32le` respectively, as described in the [FFMPEG guide to PCM formats here](https://trac.ffmpeg.org/wiki/audio%20types#SampleFormats). If you'd like more PCM formats to be added, feel free to raise an issue.

## Example base64 audio

Below is an example playing 16-bit integer PCM audio represented as base64. For the full data, see [this example file](../web-pcm-player/example/example.html) for the full data and vanilla JS example.

```TSX
import { usePCMAudioPlayer } from '@speechmatics/web-pcm-player-react';
import { useMemo } from 'react';

const base64Data = [
  // See this file for full test data:
  // packages/web-pcm-player/example/example.html
]

export default function Component() {
  const audioContext = useMemo(
    () => new AudioContext({ sampleRate: 16_000 }),
    [],
  );

  const { playAudio, volumePercentage, setVolumePercentage } =
    usePCMAudioPlayer(audioContext);

  async function playTestAudio() {
    await audioContext.resume();

    for (const audioChunk of base64Data) {
      const buffer = Uint8Array.from(atob(audioChunk), (c) => c.charCodeAt(0));
      const data = new Int16Array(buffer.buffer);
      playAudio(data);
    }
  }

  function handleVolumeChange(e) {
    setVolumePercentage(Number(e.target.value));
  }

  return (
    <div>
      <button type="button" onClick={playTestAudio}>
        Play
      </button>
      <br />
      <label>
        Volume
        <input
          type="range"
          value={volumePercentage}
          onChange={handleVolumeChange}
        />
      </label>
    </div>
  );
}

```


## React context

The above example uses the hook `usePCMAudioPlayer`, which works for many use cases, but may be inconvenient if the audio player data needs to be shared across a large application. To solve this problem, we provide additional utilities for using [React Context](https://react.dev/learn/passing-data-deeply-with-context).

1. Wrap your app/section of your app in the provided `PCMPlayerProvider`, initializing it with an audioContext.

```TSX
import { PCMPlayerProvider } from '@speechmatics/web-pcm-player-react';

export function ({ children }) {
  const audioContext = useMemo(
    () =>
      // Note audioContext may be undefined if we are rendering on the server. The provider supports this
      typeof window !== "undefined" ? new AudioContext() : undefined,
    [],
  );

  <PCMPlayerProvider audioContext={audioContext}>
    {children}
  </PCMPlayerProvider>
}
```

Then in any child of `Root`:

```TSX
import { usePCMAudioPlayerContext } from '@speechmatics/web-pcm-player-react';

const base64Data = [
  // See this file for full test data:
  // packages/web-pcm-player/example/example.html
]

export default function Component() {
  const { playAudio, volumePercentage, setVolumePercentage } =
    usePCMAudioPlayerContext();

  async function playTestAudio() {
    await audioContext.resume();

    for (const audioChunk of base64Data) {
      const buffer = Uint8Array.from(atob(audioChunk), (c) => c.charCodeAt(0));
      const data = new Int16Array(buffer.buffer);
      playAudio(data);
    }
  }

  function handleVolumeChange(e) {
    setVolumePercentage(Number(e.target.value));
  }

  // ...
 
}

```

**Note**: We intentionally leave the management of the `audioContext` up to you the developer. Applications differ in their audio needs, and it is recommended to re-use/share audio contexts as much as possible (see [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)).