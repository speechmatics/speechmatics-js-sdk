# Speechmatics Flow client (React) 🤖 ⚛

React hooks for interacting with the [Speechmatics Flow API](https://docs.speechmatics.com/flow/getting-started).

This package wraps the `@speechmatics/flow-client` package for use in React projects.

## Installlation

```
npm i @speechmatics/flow-client-react
```

## Usage


1. Use the `FlowProvider` at a high level of your component tree:

    ```JSX
    import { FlowProvider } from "@speechmatics/flow-client-react";

    function RootLayout({children}) {
      <FlowProvider appId="your-app-id">
        {children}
      </FlowProvider>
    }
    ```
    Note that`FlowProvider` is a [client component](https://nextjs.org/docs/app/building-your-application/rendering/client-components), like any other context provider. In NextJS, it's best to put this either in a root layout, or inside another client component. For frameworks like Remix which don't use React Server Components, it should work anywhere.

    _Note for React Native_: Pass `websocketBinaryType="arraybuffer"` to the `FlowProvider` as it is more reliable than the Blob implementation.

1. Inside a component below the `FlowProvider`:
    ```JSX
    function MyComponent() {
      const { startConversation, endConversation, sendAudio } = useFlow()
    }
    ```


1. Connect and start conversation
  
    `startConversation` is a function which requires a JWT to open a websocket and begin a session.
  
    See our documentation about generating JWTs (temporary keys): https://docs.speechmatics.com/introduction/authentication#temporary-keys

    An example credentials fetching flow can be found in the [NextJS example](/examples/nextjs/src/lib/fetch-credentials.ts).
  
    ```typescript
      await startConversation(jwt, {
        config: {
          template_id: personaId,
          template_variables: {},
        },
        // `audioFormat` is optional. The value below is the default:
        audioFormat: {
          type: 'raw',
          encoding: 'pcm_s16le', // this can also be set to 'pcm_f32le' for 32-bit Float
          sample_rate: 16000,
        },
      });
    ```


1. Sending audio

    The `sendAudio` function above accepts any `ArrayBufferLike`. You should send a buffer with the audio encoded as you requested when calling `startConversation` (either 32-bit float or 16-bit signed integer PCM).


1. Listen for audio and messages

    Incoming data from the Flow service can be subscribed to using the `useFlowEventListener` hook:

    ```TSX
    // Handling Messages
    useFlowEventListener("message", ({ data }) => {
      if (data.message === "AddTranscript") {
        // handle transcript message
      }
    });

    // Handling audio
    useFlowEventListener("agentAudio", (audio) => {
      // Incoming audio data is always 16-bit signed int PCM.
      // How you handle this depends on your environment.
      myPlayAudioFunction(audio.data);
    })
    ```