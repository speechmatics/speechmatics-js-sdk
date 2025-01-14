import type {
  AddPartialTranscriptMessage,
  AddTranscriptMessage,
  RecognitionResultAttachesToEnum,
} from '@speechmatics/flow-client-react';

const CHANGE = 'change';

export class Partials extends EventTarget {
  partials: Word[] = [];

  update(event: Readonly<AddTranscriptMessage | AddPartialTranscriptMessage>) {
    if (!event.results.length) return;

    const incomingWords = getWords(event);
    if (event.message === 'AddPartialTranscript') {
      this.partials = incomingWords;
    } else {
      const resultsEndAt = incomingWords[incomingWords.length - 1].endTime;

      this.partials = this.partials.filter((p) => {
        return p.startTime >= resultsEndAt && p.endTime > resultsEndAt;
      });

      if (
        !!this.partials.length &&
        event.results[0].is_eos &&
        this.partials[0].punctuation &&
        this.partials[0].eos
      ) {
        this.partials.shift();
      }
    }
    this.dispatchEvent(new Event(CHANGE));
  }
}

export function getWords(
  event: AddTranscriptMessage | AddPartialTranscriptMessage,
): Word[] {
  return event.results.map((r) => {
    const word = {
      startTime: r.start_time,
      endTime: r.end_time,
      text: r.alternatives?.[0].content ?? '',
      speaker: r.alternatives?.[0].speaker ?? 'UU',
      partial: event.message === 'AddPartialTranscript',
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

export function wordsToText(words: readonly Word[]): string {
  return words.reduce(
    (text, word) =>
      `${text}${words.indexOf(word) > 0 && !word.punctuation ? ' ' : ''}${word.text}`,
    '',
  );
}
