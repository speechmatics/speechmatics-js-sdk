# Speechmatics Real-time client (React) ⚛

React hooks for interacting with the [Speechmatics Real-time transcription API](https://docs.speechmatics.com/rt-api-ref).

This package wraps the `@speechmatics/real-time-client` package for use in React projects.

## Installlation

```
npm i @speechmatics/real-time-client-react
```

> [!WARNING]  
> For React Native, make sure to install the [`event-target-polyfill`](https://www.npmjs.com/package/event-target-polyfill) package, or any other polyfill for the [`EventTarget` class](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)

## Usage

Below is an example of usage in the browser.


1. Use the `RealtimeTranscriptionProvider` at a high level of your component tree:

    ```JSX
    import { RealtimeTranscriptionProvider } from "@speechmatics/real-time-client-react";

    function RootLayout({children}) {
      <RealtimeTranscriptionProvider appId="your-app-id">
        {children}
      </RealtimeTranscriptionProvider>
    }
    ```
    Note that`RealtimeTranscriptionProvider` is a [client component](https://nextjs.org/docs/app/building-your-application/rendering/client-components), like any other context provider. In NextJS, it's best to put this either in a root layout, or inside another client component. For frameworks like Remix which don't use React Server Components, it should work anywhere.

1. Inside a component below the `RealtimeTranscriptionProvider`:
    ```JSX
    import {
      type RealtimeTranscriptionConfig,
      useRealtimeTranscription,
    } from '@speechmatics/real-time-client-react';
    
    // If targetting the browser, this package is useful for capturing audio
    // See https://www.npmjs.com/package/@speechmatics/browser-audio-input-react
    import {
      usePcmAudioListener,
      usePcmAudioRecorder,
    } from '@speechmatics/browser-audio-input-react';

    // We recommend 16_000Hz sample rate for speech audio.
    // Anything higher will be downsampled server-side
    const RECORDING_SAMPLE_RATE = 16_000;

    function MyComponent() {
      const { startTranscription, stopTranscription, sendAudio, socketState } =
        useRealtimeTranscription();

      const { isRecording, startRecording, stopRecording } = usePcmAudioRecorder();

      // Send audio to Speechmatics when captured
      usePcmAudioListener(sendAudio);

      const startSession = useCallback(
        async ({
          deviceId,
          ...config
        }: RealtimeTranscriptionConfig & { deviceId?: string }) => {

          // getJWT can fetch an ephemeral key based on your setup
          // See our NextJS example: https://github.com/speechmatics/speechmatics-js-sdk/blob/main/examples/nextjs/src/app/actions.ts
          const jwt = await getJWT('rt');

          // Start a Speechmatics session, then start recording to stream the audio
          await startTranscription(jwt, config);
          await startRecording({ deviceId, sampleRate: RECORDING_SAMPLE_RATE });
        },
        [startTranscription, startRecording],
      );
    }
    ```
