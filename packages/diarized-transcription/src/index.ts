import { TypedEventTarget } from 'typescript-event-target';

export interface DiarizedTranscriptionItem {
  speaker: string;
  partialText?: string;
  text?: string;
  startTime: number;
  endTime?: number;
}

export interface TranscriptionChunk {
  text: string;
  startTime: number;
  endTime?: number;
  speaker: string;
}

export class DiarizedTranscription extends TypedEventTarget<{ change: Event }> {
  private _items: DiarizedTranscriptionItem[] = [];

  get items() {
    return this._items;
  }

  handleTranscriptionChunk(
    type: 'partial' | 'final',
    chunk: TranscriptionChunk,
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
