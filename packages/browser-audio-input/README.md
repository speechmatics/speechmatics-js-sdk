# `@speechmatics/browser-audio-input`

This package provides Javascript utilities for managing audio input devices and permissions in the browser.

It also provides utilities for capturing PCM data from these devices, if desired.

## Installation

```
npm i @speechmatics/browser-audio-input
```

## Usage

### Querying input devices

```typescript
import { getAudioDevicesStore } from "@speechmatics/browser-audio-input";
const audioDevices = getAudioDevicesStore();

audioDevices.addEventListener("changeDevices", (e) => {
  if (audioDevices.permissionState === "granted") {
    // This will print all available devices
    console.log(audioDevices.devices)
  }
});
```


See the README for [`@speechmatics/browser-audio-input-react`](https://www.npmjs.com/package/@speechmatics/browser-audio-input-react) for a complete example.

We will add non-React examples soon. If you'd like to request a specific one, feel free to [file an issue](https://github.com/speechmatics/speechmatics-js-sdk/issues)!

## Capturing PCM audio

To capture PCM audio, you must supply an `AudioContext`. From there, this library deals with dispatching audio events which can be subscribed to:

```typescript
import {
  type InputAudioEvent,
  PCMRecorder,
} from '@speechmatics/browser-audio-input';

const PCMRecorder = new PCMRecorder("/path/to/pcm-audio-worklet.min.js"); // <- (see note below about this)

PCMRecorder.addEventListener('recordingStarted', () => {
  console.log("Recording started!");
});

// Later in your app...
const audioContext = new AudioContext();
pcmRecorder.startRecording({ audioContext });
```

#### Specifying input device

You can also pass a device ID like so:

```typescript
import { getAudioDevicesStore } from "@speechmatics/browser-audio-input";

const audioContext = new AudioContext();

// This picks the first device ID (assuming permission has been granted)
const audioDevices = getAudioDevicesStore();
const deviceId = audioDevices.permissionState === "granted" ? audioDevices.devices[0] : undefined;
pcmRecorder.startRecording({ audioContext, deviceId });
```

#### Recording options

You can pass whatever ['MediaTrackSettings'](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings) you want through the `recordingOptions` property:

```typescript
pcmRecorder.startRecording({
  audioContext,
  deviceId,
  recordingOptions: {
    noiseSuppression: false,
  },
});
```

By default we enable the following to optimize for speech:

```javascript
{
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
}
```

Note that the last two [may not be supported in Safari](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/autoGainControl#browser_compatibility)


### Note about `AudioWorklet` script URL

When recording audio in the browser, there are generally three approaches:

- ❌ [`createScriptProcessor()`](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createScriptProcessor): Can capture PCM data on the main thread, but is deprecated and suffers from poor performance easily.
- ❌ [`MediaRecorder`](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder): Provides a simple API, but cannot capture PCM data (only MPEG/OGG)
- ✅ [`AudioWorklet`](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet): Captures/processes PCM on dedicated thread.

This library leverages `AudioWorklet` to capture PCM audio (specifically 32-bit Float PCM, which is the underlying representation in the browser).

Since `AudioWorklets` run outside the main thread, their code must be run from an external source (i.e. a URL).

The code for this PCM audio processor is provided by this library at `/dist/pcm-audio-worklet.min.js`. However, **how this script is loaded depends on your bundler setup**.

Modern bundlers can emit the worklet as an asset and give you its URL — that's the approach we recommend. Each example below produces a URL string, which you then pass to `new PCMRecorder(workletScriptURL)`.

### Turbopack (e.g. Next.js 16+)

Turbopack can emit the worklet as an [asset](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack) and resolve the import to its URL. Add a rule to your `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      // Emit the worklet as an asset; the import below resolves to its URL.
      '**/pcm-audio-worklet.min.js': {
        type: 'asset',
      },
    },
  },
};

export default nextConfig;
```

Then import the worklet URL directly:

```typescript
import workletScriptURL from '@speechmatics/browser-audio-input/pcm-audio-worklet.min.js';

const recorder = new PCMRecorder(workletScriptURL);
```

This package ships a type declaration for the `pcm-audio-worklet.min.js` subpath, so the import is typed as a `string` with no extra setup.

### Webpack (v5+)

Webpack 5 has built-in [asset modules](https://webpack.js.org/guides/asset-modules/), so no plugins are required. Configure the worklet to be emitted as a resource:

```javascript
module.exports = {
  // ... rest of your Webpack config
  module: {
    rules: [
      {
        test: /pcm-audio-worklet\.min\.js$/,
        type: 'asset/resource',
      },
    ],
  },
};
```

The import then resolves to the emitted file's URL:

```typescript
import workletScriptURL from '@speechmatics/browser-audio-input/pcm-audio-worklet.min.js';

const recorder = new PCMRecorder(workletScriptURL);
```

<details>
<summary>Older Webpack (last resort)</summary>

If you're on Webpack 4, which predates asset modules, you can copy the worklet into your `public/` folder with [`copy-webpack-plugin`](https://webpack.js.org/plugins/copy-webpack-plugin):

```javascript
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  // ... rest of your Webpack config
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: require.resolve(
            '@speechmatics/browser-audio-input/pcm-audio-worklet.min.js',
          ),
          to: path.resolve(__dirname, 'public/js/[name][ext]'),
        },
      ],
    }),
  ],
};
```

Then reference it by its public path, e.g. `new PCMRecorder('/js/pcm-audio-worklet.min.js')`.

</details>

### Vite

Vite supports referencing bundled code by URL with the [`?url` suffix](https://vite.dev/guide/assets#explicit-url-imports):

```typescript
import workletScriptURL from '@speechmatics/browser-audio-input/pcm-audio-worklet.min.js?url';

const recorder = new PCMRecorder(workletScriptURL);
```
