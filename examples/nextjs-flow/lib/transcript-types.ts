// transcript-types.ts
import type {
  AddPartialTranscriptMessage,
  AddTranscriptMessage,
  RecognitionResultAttachesToEnum,
  ResponseCompletedMessage,
  ResponseInterruptedMessage,
  ResponseStartedMessage,
} from '@speechmatics/flow-client-react';

export type FlowMessage =
  | AddTranscriptMessage
  | AddPartialTranscriptMessage
  | ResponseStartedMessage
  | ResponseCompletedMessage
  | ResponseInterruptedMessage;

export type Word = {
  startTime: number;
  endTime: number;
  speaker: string;
  text: string;
  partial: boolean;
} & (
  | { punctuation: false }
  | {
      punctuation: true;
      eos: boolean;
      attachesTo?: RecognitionResultAttachesToEnum;
    }
);

export type AgentResponse = {
  speaker: 'agent';
  agent: true;
  startTime: number;
  endTime?: number;
  text: string;
};

export type TranscriptGroup =
  | {
      type: 'speaker';
      speaker: string;
      data: Word[];
    }
  | {
      type: 'agent';
      data: AgentResponse[];
    };

export class TranscriptUpdateEvent extends Event {
  constructor(
    public readonly transcriptGroups: TranscriptGroup[],
    eventInitDict?: EventInit,
  ) {
    super('update', eventInitDict);
  }
}

export interface TranscriptManagerEvents {
  update: TranscriptUpdateEvent;
}
