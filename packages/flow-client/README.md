
# Speechmatics Flow client 🤖

Official Javascript client for the Speechmatics Flow API.

## Installation

```
npm i @speechmatics/flow-client
```

> [!WARNING]  
> For React Native, make sure to install the [`event-target-polyfill`](https://www.npmjs.com/package/event-target-polyfill) package, or any other polyfill for the [`EventTarget` class](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)

## Usage

The two main exports from this package are the `FlowClient` class, and the `fetchPersonas` function.

The `FlowClient` class is an [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget). You can listen for incoming events including audio and transcription messages:

```typescript
import { FlowClient, AgentAudioEvent } from "@speechmatics/flow-client";
const flowClient = new FlowClient('wss://flow.api.speechmatics.com', { appId: "example" });

function onAgentAudio(audio: AgentAudioEvent) {
  // audio.data is PCM16_SLE data. How you play this depends on your environment
  myAudioPlayFunction(audio.data)
}

flowClient.addEventListener("agentAudio", onAgentAudio);

flowClient.startConversation(YOUR_JWT, {
  config: {
    template_id: "flow-service-assistant-amelia",
    template_variables: {},
  },
  // Optional, this is the default
  audio_format: {
    type: 'raw',
    encoding: 'pcm_s16le',
    sample_rate: 16000,
  },
});

// PCM audio can be sent to the client (either f32 or int16 depending on the audio_format defined above)
function onPCMAudio(audio: Int16Array) {
  flowClient.sendAudio(audio);
}


function onSessionEnd() {
  // Ends conversation and closes websocket
  flowClient.endConversation();

  // Event listeners can also be removed like so
  flowClient.removeEventListener("agentAudio", onAgentAudio);
}
```

### React hooks

See the package `@speechmatics/flow-client-react` for integration with React based projects.
