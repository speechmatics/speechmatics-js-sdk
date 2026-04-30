import type { FlowServerMessage } from '../models';

// Custom event gets fired when we receive agent TTS audio
// The underlying data is PCM16_SLE, represented as an Int16Array
export class AgentAudioEvent extends Event {
  constructor(public readonly data: Int16Array) {
    super('agentAudio');
  }
}

export class FlowServerMessageEvent extends Event {
  constructor(public readonly data: FlowServerMessage) {
    super('message');
  }
}

export interface FlowClientEventMap {
  agentAudio: AgentAudioEvent;
  message: FlowServerMessageEvent;

  socketInitialized: Event;
  socketOpen: Event;
  socketClosing: Event;
  socketClose: Event;
  socketError: Event;
}
