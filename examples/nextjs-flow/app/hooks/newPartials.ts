// types.ts

import type { FlowClientIncomingMessage } from '@speechmatics/flow-client-react';

/**
 * Represents incoming messages from the speech-to-text service
 * These messages can be transcripts, partial transcripts, or agent responses
 */
export interface FlowMessage {
  message:
    | 'AddPartialTranscript'
    | 'AddTranscript'
    | 'ResponseStarted'
    | 'ResponseCompleted'
    | 'ResponseInterrupted';
  results?: Array<{
    start_time: number;
    end_time: number;
    type?: 'punctuation';
    is_eos?: boolean; // end of sentence marker
    attaches_to?: 'previous' | 'next'; // indicates how punctuation attaches to words
    alternatives?: Array<{
      content: string; // the actual text content
      speaker: string; // speaker identifier
    }>;
  }>;
  start_time?: number;
  end_time?: number;
  content?: string;
}

/**
 * Represents a single word in the transcript
 * Can be either a regular word or punctuation
 */
export type Word = {
  startTime: number;
  endTime: number;
  speaker: string;
  text: string;
  partial: boolean; // indicates if this is from a partial transcript
} & (
  | { punctuation: false }
  | {
      punctuation: true;
      eos: boolean; // end of sentence marker
      attachesTo?: 'previous' | 'next';
    }
);

/**
 * Represents a response from an AI agent in the conversation
 */
export type AgentResponse = {
  speaker: 'agent';
  agent: true;
  startTime: number;
  endTime?: number;
  text: string;
};

/**
 * Groups of transcript data, either from a human speaker or an AI agent
 */
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

// transcript-manager.ts
/**
 * Manages the state and processing of a real-time transcript
 * Handles both human speech transcription and AI agent responses
 * Uses EventTarget to notify listeners of updates
 */
export class TranscriptManager extends EventTarget {
  // Store final transcribed words
  private finals: Word[] = [];
  // Store partial (in-progress) transcribed words
  private partials: Word[] = [];
  // Store AI agent responses
  private agentResponses: AgentResponse[] = [];

  constructor() {
    super();
    this.handleMessage = this.handleMessage.bind(this);
  }

  /**
   * Main entry point for processing incoming messages
   * Routes different message types to their appropriate handlers
   */
  handleMessage(message: FlowClientIncomingMessage) {
    // Only process messages we care about
    switch (message.message) {
      case 'AddPartialTranscript':
      case 'AddTranscript':
      case 'ResponseStarted':
      case 'ResponseCompleted':
      case 'ResponseInterrupted':
        this.processMessage(message as FlowMessage);
        break;
      // Ignore other message types
      default:
        return;
    }
  }

  private processMessage(message: FlowMessage) {
    switch (message.message) {
      case 'AddPartialTranscript':
        this.handlePartialTranscript(message);
        break;
      case 'AddTranscript':
        this.handleTranscript(message);
        break;
      case 'ResponseStarted':
        this.handleAgentResponseStart(message);
        break;
      case 'ResponseCompleted':
      case 'ResponseInterrupted':
        this.handleAgentResponseEnd(message);
        break;
    }
  }

  /**
   * Processes partial transcripts (in-progress speech)
   * These are temporary and will be replaced by final transcripts
   */
  private handlePartialTranscript(message: FlowMessage) {
    if (!message.results?.length) return;
    this.partials = this.getWords(message);
    this.notifyUpdate();
  }

  /**
   * Processes final transcripts
   * Also handles cleanup of related partial transcripts
   */
  private handleTranscript(message: FlowMessage) {
    if (!message.results?.length) return;
    const incomingWords = this.getWords(message);
    this.finals = [...this.finals, ...incomingWords];

    // Remove any partial transcripts that have been finalized
    const resultsEndAt = incomingWords[incomingWords.length - 1].endTime;
    this.partials = this.partials.filter(
      (p) => p.startTime >= resultsEndAt && p.endTime > resultsEndAt,
    );

    // Special handling for end-of-sentence punctuation
    if (
      this.partials.length &&
      message.results[0].is_eos &&
      this.partials[0].punctuation &&
      this.partials[0].eos
    ) {
      this.partials.shift();
    }

    this.notifyUpdate();
  }

  /**
   * Handles the start of an AI agent response
   * Creates a new agent response entry with start time
   */
  private handleAgentResponseStart(message: FlowMessage) {
    if (!message.content || !message.start_time) return;

    this.agentResponses.push({
      speaker: 'agent',
      agent: true,
      startTime: message.start_time,
      text: message.content,
    });

    this.notifyUpdate();
  }

  /**
   * Handles the completion or interruption of an AI agent response
   * Updates the existing response or creates a new one if not found
   */
  private handleAgentResponseEnd(message: FlowMessage) {
    if (!message.content || !message.start_time || !message.end_time) return;

    const existingIndex = this.agentResponses.findIndex(
      (r) => r.startTime === message.start_time,
    );

    const updatedResponse = {
      speaker: 'agent' as const,
      agent: true as const,
      startTime: message.start_time,
      endTime: message.end_time,
      text: message.content,
    };

    if (existingIndex !== -1) {
      this.agentResponses[existingIndex] = updatedResponse;
    } else {
      this.agentResponses.push(updatedResponse);
    }

    this.notifyUpdate();
  }

  /**
   * Converts raw message results into Word objects
   * Handles both regular words and punctuation
   */
  private getWords(message: FlowMessage): Word[] {
    if (!message.results) return [];

    return message.results.map((r) => {
      const word = {
        startTime: r.start_time,
        endTime: r.end_time,
        text: r.alternatives?.[0]?.content ?? '',
        speaker: r.alternatives?.[0]?.speaker ?? 'UU', // UU = Unknown User
        partial: message.message === 'AddPartialTranscript',
      };

      if (r.type === 'punctuation') {
        return {
          ...word,
          punctuation: true,
          eos: r.is_eos ?? false,
          attachesTo: r.attaches_to,
        };
      }
      return { ...word, punctuation: false };
    });
  }

  /**
   * Generates the current state of the transcript
   * Groups words and responses by speaker and chronological order
   */
  getTranscriptGroups(): TranscriptGroup[] {
    const sentences = this.getSentences();
    const sentencesAndResponses = [...sentences, ...this.agentResponses];

    // Sort everything by start time
    sentencesAndResponses.sort((a, b) => {
      const startTimeA = 'agent' in a ? a.startTime : a[0].startTime;
      const startTimeB = 'agent' in b ? b.startTime : b[0].startTime;
      return startTimeA - startTimeB;
    });

    const allSorted = sentencesAndResponses.flat();
    const groups: TranscriptGroup[] = [];
    let currentGroup: TranscriptGroup | undefined;

    // Group consecutive items from the same speaker together
    for (const wordOrResponse of allSorted) {
      if (!currentGroup) {
        currentGroup =
          'agent' in wordOrResponse
            ? { type: 'agent', data: [wordOrResponse] }
            : {
                type: 'speaker',
                data: [wordOrResponse],
                speaker: wordOrResponse.speaker,
              };
        continue;
      }

      if (currentGroup.type === 'agent' && 'agent' in wordOrResponse) {
        currentGroup.data.push(wordOrResponse);
      } else if (
        currentGroup.type === 'speaker' &&
        !('agent' in wordOrResponse) &&
        wordOrResponse.speaker === currentGroup.speaker
      ) {
        currentGroup.data.push(wordOrResponse);
      } else {
        groups.push(currentGroup);
        currentGroup =
          'agent' in wordOrResponse
            ? { type: 'agent', data: [wordOrResponse] }
            : {
                type: 'speaker',
                data: [wordOrResponse],
                speaker: wordOrResponse.speaker,
              };
      }
    }

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Groups words into sentences based on punctuation and end-of-sentence markers
   */
  private getSentences(): Word[][] {
    const sentences: Word[][] = [];
    let currentSentence: Word[] = [];

    for (const word of [...this.finals, ...this.partials]) {
      currentSentence.push(word);
      if (word.punctuation && word.eos) {
        sentences.push(currentSentence);
        currentSentence = [];
      }
    }

    if (currentSentence.length) {
      sentences.push(currentSentence);
    }

    return sentences;
  }

  /**
   * Notifies listeners of updates to the transcript
   * Dispatches a CustomEvent with the current transcript groups
   */
  private notifyUpdate() {
    this.dispatchEvent(
      new CustomEvent('update', {
        detail: this.getTranscriptGroups(),
      }),
    );
  }

  /**
   * Utility function to convert an array of words into readable text
   * Handles spacing between words and punctuation
   */
  static wordsToText(words: readonly Word[]): string {
    return words.reduce(
      (text, word) =>
        `${text}${words.indexOf(word) > 0 && !word.punctuation ? ' ' : ''}${word.text}`,
      '',
    );
  }
}

// Example usage:
/*
const transcriptManager = new TranscriptManager();

// Listen for updates
transcriptManager.addEventListener('update', (event: CustomEvent) => {
  const transcriptGroups = event.detail;
  // Handle updated transcript groups
});

// Process incoming messages
transcriptManager.handleMessage({
  message: 'AddTranscript',
  results: [
    // message data
  ]
});
*/
