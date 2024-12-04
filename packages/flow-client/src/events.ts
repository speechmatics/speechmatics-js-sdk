//////////////////////////////////////////////
// Incoming messages: server -> client
//////////////////////////////////////////////
import type { RecognitionResult, RecognitionMetadata } from '../models';

export type ConversationStartedMessage = {
  message: 'ConversationStarted';
  id: string;
  asr_session_id: string;
  language_pack_info: {
    adapted: boolean;
    itn: boolean;
    language_description: string;
    word_delimiter: string;
    writing_direction: 'left-to-right' | 'right-to-left';
  };
};

export type AudioAddedMessage = {
  message: 'AudioAdded';
  seq_no: number;
};

export type ResponseStartedMessage = {
  message: 'ResponseStarted';
  content: string;
  start_time: number;
};

export type ResponseCompletedMessage = {
  message: 'ResponseCompleted';
  content: string;
  start_time: number;
  end_time: number;
};

export type AddTranscriptMessage = {
  message: 'AddTranscript';
  results: Array<RecognitionResult>;
  metadata: RecognitionMetadata;
};

export interface AddPartialTranscriptMessage {
  message: 'AddPartialTranscript';
  format?: string;
  metadata: RecognitionMetadata;
  results: Array<RecognitionResult>;
}

export type ResponseInterruptedMessage = {
  message: 'ResponseInterrupted';
  content: string;
  start_time: number;
  end_time: number;
};

export type ConversationEndingMessage = {
  message: 'ConversationEnding';
};

export type ConversationEndedMessage = {
  message: 'ConversationEnded';
};

export type InfoMessage = {
  message: 'Info';
  [k: string]: unknown;
};

export type WarningMessage = {
  message: 'Warning';
  [k: string]: unknown;
};

export type ErrorMessage = {
  message: 'Error';
  [k: string]: unknown;
};

export type FlowClientIncomingMessage =
  | ConversationStartedMessage
  | AudioAddedMessage
  | ResponseStartedMessage
  | ResponseCompletedMessage
  | ResponseInterruptedMessage
  | AddTranscriptMessage
  | AddPartialTranscriptMessage
  | ConversationEndingMessage
  | ConversationEndedMessage
  | InfoMessage
  | WarningMessage
  | ErrorMessage;

//////////////////////////////////////////////
// Outgoing messages: client -> server
//////////////////////////////////////////////

type AudioFormat = {
  type: 'raw';
  encoding: 'pcm_s16le' | 'pcm_f32le';
  sample_rate: number;
};

export interface StartConversationMessage {
  message: 'StartConversation';
  conversation_config: {
    template_id: string;
    template_variables: { [key: string]: string };
  };
  audio_format: AudioFormat;
}

export interface AudioReceivedMessage {
  message: 'AudioReceived';
  seq_no: number;
  buffering: number;
}

export interface AudioEndedMessage {
  message: 'AudioEnded';
  last_seq_no: number;
}

export type FlowClientOutgoingMessage =
  | StartConversationMessage
  | AudioReceivedMessage
  | AudioEndedMessage;

/////////////////////////////////////////////
// Event Map
/////////////////////////////////////////////

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
