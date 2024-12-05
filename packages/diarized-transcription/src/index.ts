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
  private _items: ReadonlyArray<SpeakeriarizedTranscriptionItem> = [];

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

    console.log(type, JSON.stringify(chunk));

    const items = [...this._items];

    const itemBelongingToThisChunk = items.findLast((item) => {
      if (item.speaker !== chunk.speaker) return false;
      if (item.startTime > chunk.startTime) return false;
      if (
        item.endTime !== undefined &&
        chunk.endTime !== undefined &&
        item.endTime < chunk.startTime
      )
        return false;
      return true;
    });

    // If there is no item belonging to this chunk, insert a new item at the right chronological index
    if (!itemBelongingToThisChunk) {
      let indexToInsert = items.length;
      while (items[indexToInsert - 1]?.startTime > chunk.startTime) {
        indexToInsert--;
      }
      items.splice(indexToInsert, 0, {
        speaker: chunk.speaker,
        partialText: type === 'partial' ? chunk.text : undefined,
        text: type === 'final' ? chunk.text : undefined,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
      });
    } else {
      // Else, update existing item
      const index = items.indexOf(itemBelongingToThisChunk);
      items[index] = {
        ...items[index],
        partialText: type === 'partial' ? chunk.text : undefined,
        text:
          type === 'final'
            ? `${items[index].text ?? ''}${chunk.text}`
            : items[index].text,
        endTime: chunk.endTime,
      };
    }

    this._items = items;
    this.dispatchTypedEvent('change', new Event('change'));
  }

  clearTranscript() {
    this._items = [];
    this.dispatchTypedEvent('change', new Event('change'));
  }
}
