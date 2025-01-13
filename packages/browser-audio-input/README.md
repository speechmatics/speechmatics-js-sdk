# `@speechmatics/browser-audio-input`

This package provides Javascript utilities for managing audio input devices and permissions in the browser.

It also provides utilities for capturing PCM data from these devices, if desired.

## Installation

```
npm i @speechmatics/browser-audio-input
```

## Usage

### Selecting and managing input devices

See the README for [`@speechmatics/browser-audio-input-react`](https://www.npmjs.com/package/@speechmatics/browser-audio-input-react) for a complete example.

We will add non-React examples soon. If you'd like to request a specific one, feel free to [file an issue](https://github.com/speechmatics/speechmatics-js-sdk/issues)!

## Capturing PCM audio

```typescript
import {
  type InputAudioEvent,
  PcmRecorder,
} from '@speechmatics/browser-audio-input';

const pcmRecorder = new PcmRecorder("/path/to/pcm-audio-worklet.min.js"); // <- (see note below about this)

pcmRecorder.addEventListener('recordingStarted', () => {
  console.log("Recording started!");
});

pcmRecorder.startRecording()

```

### Note about `AudioWorklet` script URL

When recording audio in the browser, there are generally three approaches:

- ❌ [`createScriptProcessor()`](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createScriptProcessor): Can capture PCM data on the main thread, but is deprecated and suffers from poor performance easily.
- ❌ [`MediaRecorder`](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder): Provides a simple API, but cannot capture PCM data (only MPEG/OGG)
- ✅ [`AudioWorklet`](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet): Captures/processes PCM on dedicated thread.

This library leverages `AudioWorklet` to capture PCM audio (specifically 32-bit Float PCM, which is the underlying representation in the browser).

Since `AudioWorklets` run outside the main thread, their code must be run from an external source (i.e. a URL).

The code for this PCM audio processor is provided by this library at `/dist/pcm-audio-worklet.min.js`. However, **how this script is loaded depends on your bundler setup**.

### Webpack

At the moment, Webpack doesn't have a great story for `AudioWorklet` scripts (see [Github issue](https://github.com/webpack/webpack/issues/11543)). Instead, we recommend installing the `copy-webpack-plugin` package to be able to copy our `pcm-audio-worklet.min.js` directly into your `/public` folder:

```javascript
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  // ... rest of your Webpack config
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            'node_modules/@speechmatics/browser-audio-input/dist/pcm-audio-worklet.min.js',
          ),
          to: path.resolve(__dirname, 'public/js/[name][ext]'),
        },
      ],
    }),
  ]
};

```

See [Webpack documentation](https://webpack.js.org/plugins/copy-webpack-plugin) for more details.

### Vite

Vite supports referencing bundled code by URL for use in Workers. This can be used like so:


```typescript
import {
  type InputAudioEvent,
  PcmRecorder,
} from '@speechmatics/browser-audio-input';
import pcmAudioWorkletUrl from "@speechmatics/browser-audio-input/pcm-audio-worklet.min.js?url";

const pcmRecorder = new PcmRecorder(pcmAudioWorkletUrl);
```
