import { TypedEventTarget } from 'typescript-event-target';

export interface SpeakeriarizedTranscriptionItem {
  speaker: string;
  partialText?: string;
  text?: string;
  startTime: number;
  endTime?: number;
}

export interface SpeakerDiarizedTranscriptionChunk {
  text: string;
  startTime: number;
  endTime?: number;
  speaker: string;
}

export class SpeakerDiarizedTranscription extends TypedEventTarget<{
  change: Event;
}> {
  private _items: SpeakeriarizedTranscriptionItem[] = [];

  get items() {
    return this._items;
  }

  handleTranscriptionChunk(
    type: 'partial' | 'final',
    chunk: SpeakerDiarizedTranscriptionChunk,
  ) {
    // Ignore if there is no text transcribed in this chunk
    if (chunk.text === '') {
      return;
    }

    const lastItemBeforeNow = this._items.findLast(
      (item) => item.startTime <= chunk.startTime,
    );

    const item =
      lastItemBeforeNow?.speaker === chunk.speaker
        ? lastItemBeforeNow
        : {
            speaker: chunk.speaker,
            partialText: type === 'partial' ? chunk.text : undefined,
            text: type === 'final' ? chunk.text : undefined,
            startTime: chunk.startTime,
            endTime: chunk.endTime,
          };

    const index = this._items.indexOf(item);
    if (index < 0) {
      this._items.push(item);
    } else {
      this._items[index] = {
        ...this._items[index],
        partialText: type === 'partial' ? chunk.text : undefined,
        text:
          type === 'final'
            ? `${this.items[index].text ?? ''}${chunk.text}`
            : this.items[index].text,
        endTime: chunk.endTime,
      };
    }
    this.dispatchTypedEvent('change', new Event('change'));
  }
}
