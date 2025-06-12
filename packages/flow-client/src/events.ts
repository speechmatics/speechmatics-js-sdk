import type { ToolResult, AddInput, publish, subscribe } from '../models';

// Internal client-sent message types used by FlowClient
export type FlowClientOutgoingMessagePrivate = Exclude<publish, string>;

// client-sent message types controlled by the user
export type FlowClientOutgoingMessage = AddInput | ToolResult;

export type FlowClientIncomingMessage = Exclude<subscribe, string>;

// Custom event gets fired when we receive agent TTS audio
// The underlying data is PCM16_SLE, represented as an Int16Array
export class AgentAudioEvent extends Event {
  constructor(public readonly data: Int16Array) {
    super('agentAudio');
  }
}

export class FlowIncomingMessageEvent extends Event {
  constructor(public readonly data: FlowClientIncomingMessage) {
    super('message');
  }
}

export interface FlowClientEventMap {
  agentAudio: AgentAudioEvent;
  message: FlowIncomingMessageEvent;

  socketInitialized: Event;
  socketOpen: Event;
  socketClosing: Event;
  socketClose: Event;
  socketError: Event;
}
