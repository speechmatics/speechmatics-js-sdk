# Browser audio input (React)

React bindings for the `@speechmatics/browser-audio-input` package, letting you manage audio input devices and permissions across browsers.

## Installation

```
npm i @speechmatics/browser-audio-input-react
```

## Usage

### Microphone selection

Below is an example of a Microphone selection component.

```TSX
import { useAudioDevices } from "@speechmatics/browser-audio-input-react";

function MicrophoneSelect({
  setDeviceId,
}: { setDeviceId: (deviceId: string) => void }) {
  const devices = useAudioDevices();

  switch (devices.permissionState) {
    case 'prompt':
      return (
        <label>
          Enable mic permissions
          <select
            onClick={devices.promptPermissions}
            onKeyDown={devices.promptPermissions}
          />
        </label>
      );
    case 'prompting':
      return (
        <label>
          Enable mic permissions
          <select aria-busy="true" />
        </label>
      );
    case 'granted': {
      const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setDeviceId(e.target.value);
      };
      return (
        <label>
          Select audio device
          <select onChange={onChange}>
            {devices.deviceList.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      );
    }
    case 'denied':
      return (
        <label>
          Microphone permission disabled
          <select disabled />
        </label>
      );
    default:
      devices satisfies never;
      return null;
  }
}

```

### PCM recording

This package exposes a context provider that can be used to share a **single PCM recorder across the app**. This is quite handy, as you can control the recorder from any component in your app!

```TSX
import { PCMAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';

function App() {
  return (
    // See note in the next section about the AudioWorklet script
    <PCMAudioRecorderProvider workletScriptURL="/path/to/pcm-audio-worklet.min.js">
      <Component>
    </PCMAudioRecorderProvider>
  );
}

```
Now all child components can use the provided hooks:

### Start/stop recording

The only required argument to `startRecording` is an [`AudioContext`](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext). Note that 

`stopRecording` stops the active `MediaStream` source, but leaves the `AudioContext` open, so it can be re-used.

```TSX
import { usePCMAudioRecorderContext } from "@speechmatics/browser-audio-input-react";

function RecordingButton() {
  const { startRecording, stopRecording, isRecording } = usePCMAudioRecorderContext();

  const onClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      const audioContext = new AudioContext();
      startRecording({ audioContext });
    }
  }

  return <button onClick={onClick}>
    {isRecording ? "Stop recording" : "Start recording" }
  </button>
}
```
You can specify the device for recording by passing the `deviceId`option to `startRecording`.


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

### Read recorded data

Recorded data can be read from any child component of the context provider with the `usePCMAudioListener` hook:

```TSX

function Component() {
  usePCMAudioListener((audio: Float32Array) => {
    // Handle Float32Array of audio however you like
  });
}

```

### Note about `AudioWorklet` script URL

When recording audio in the browser, there are generally three approaches:

- ❌ [`createScriptProcessor()`](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createScriptProcessor): Can capture PCM data on the main thread, but is deprecated and suffers from poor performance easily.
- ❌ [`MediaRecorder`](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder): Provides a simple API, but cannot capture PCM data (only MPEG/OGG)
- ✅ [`AudioWorklet`](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet): Captures/processes PCM on dedicated thread.

This library leverages `AudioWorklet` to capture PCM audio (specifically 32-bit Float PCM, which is the underlying representation in the browser).

Since `AudioWorklets` run outside the main thread, their code must be run from an external source (i.e. a URL).

### Getting the AudioWorklet script

First make sure the base package (the one this package wraps) is installed:

```
npm i @speechmatics/browser-audio-input
```

The code for this PCM audio processor is provided by that library at `/dist/pcm-audio-worklet.min.js`. However, **how this script is loaded depends on your bundler setup**.

### Webpack

At the moment, Webpack doesn't have a great story for `AudioWorklet` scripts (see [Github issue](https://github.com/webpack/webpack/issues/11543)). Instead, we recommend using the `copy-webpack-plugin` to copy our `pcm-audio-worklet.min.js` directly into your `/public` folder:

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

Then use `/js/pcm-audio-worklet.min.js` (or whatever other path you define) as the path to the script:

```TSX
// WEBPACK EXAMPLE
import { PCMAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';

function App() {
  return (
    <PCMAudioRecorderProvider workletScriptURL="/js/pcm-audio-worklet.min.js">
      <Component>
    </PCMAudioRecorderProvider>
  );
}
```

### Vite

Vite supports referencing bundled code by URL for use in Workers. This can be used like so:


```TSX
// VITE EXAMPLE
import { PCMAudioRecorderProvider } from '@speechmatics/browser-audio-input-react';
import workletScriptURL from '@speechmatics/browser-audio-input/pcm-audio-worklet.min.js?url';

function App() {
  return (
    <PCMAudioRecorderProvider workletScriptURL={workletScriptURL}>
      <Component>
    </PCMAudioRecorderProvider>
  );
}
```

### Creating audio visualizers

The hook `usePCMAudioRecorderContext` provides an `analyser` object, which is an instance of [`AnalyserNode`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode).

```typescript
const { analyser } = usePCMAudioRecorderContext();
```

MDN has a [great guide on audio visualizers for the WebAudio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API). The basic idea though is that you can use `requestAnimationFrame` to repeatedly read the [`analyser.getFloatFrequencyData`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getFloatFrequencyData) method to animate whatever DOM elements you like.

See the [`AudioVisualizer`](../../examples/nextjs/src/lib/components/AudioVisualizer.tsx) in the NextJS demo app for a complete example.