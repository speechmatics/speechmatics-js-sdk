# Web PCM audio player

Package for playing PCM audio in the browser. Both signed 16-bit int and 32-bit float encodings are supported.

The player requires a given `AudioContext` to play audio within. It does not manage/change the lifecycle of the audio context (this is left to the consumer).

# Installation

# NPM

This package can be installed from NPM

```
npm i @speechmatics/web-pcm-player
```

# Import map

You can also fetch the code from UNPKG for use in an import map:

```html
<script type="importmap">
  {
    "imports": {
      "@speechmatics/web-pcm-player": "https://unpkg.com/@speechmatics/web-pcm-player@1.0.0-rc/dist/index.min.js"
    }
  }
</script>
```

# Usage

This library can be used to play PCM data from either an:
  - `Int16Array` for 16-bit unsigned integer PCM or
  - `Float32Array`. for 32-bit float PCM

These formats correspond to `pcm_s16le` and `pcm_f32le` respectively, as described in the [FFMPEG guide to PCM formats here](https://trac.ffmpeg.org/wiki/audio%20types#SampleFormats). If you'd like more PCM formats to be added, feel free to raise an issue.

## Base64 audio example

Below is an example usage playing `pcm_s16le` audio rendered as Base 64.

For a full working example, open the file `examples/example.html` in the browser.

```javascript
import { PCMPlayer } from "@speechmatics/web-pcm-player";

async function playTestAudio() {
  const audioContext = new AudioContext({ sampleRate: 16_000 });
  await audioContext.resume();
  const player = new PCMPlayer(audioContext);

  for (const audioChunk of base64Data) {
    const buffer = Uint8Array.from(atob(audioChunk), (c) =>
      c.charCodeAt(0)
    );
    const data = new Int16Array(buffer.buffer);
    player.playAudio(data);
  }
}

window.onload = () => {
  document.getElementById("play-button").addEventListener("click", () => {
    playTestAudio();
  });
};

const base64Data = [
  // See data in the examples/ folder
];
```