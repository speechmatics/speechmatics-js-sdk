import { TypedEventTarget } from 'typescript-event-target';

export interface SpeakerDiarizedTranscriptionItem {
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
  private _items: ReadonlyArray<SpeakerDiarizedTranscriptionItem> = [];

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

    console.debug(type, JSON.stringify(chunk));

    const items = [...this._items];

    const lastItemWithCurrentSpeakerIndex = items.findLastIndex(
      (item) => item.speaker === chunk.speaker,
    );

    // Clear partials for item with last speaker, regardless of whatever else we do to it.
    if (lastItemWithCurrentSpeakerIndex >= 0) {
      items[lastItemWithCurrentSpeakerIndex] = {
        ...items[lastItemWithCurrentSpeakerIndex],
        partialText: undefined,
      };
    }
    const lastItemWithCurrentSpeaker =
      lastItemWithCurrentSpeakerIndex >= 0
        ? items.at(lastItemWithCurrentSpeakerIndex)
        : undefined;

    const shouldAppendToLastSpeakerItem =
      lastItemWithCurrentSpeaker &&
      (lastItemWithCurrentSpeaker === items.at(-1) ||
        !lastItemWithCurrentSpeaker.endTime ||
        lastItemWithCurrentSpeaker.endTime >= chunk.startTime);

    if (shouldAppendToLastSpeakerItem) {
      items[lastItemWithCurrentSpeakerIndex] = {
        ...items[lastItemWithCurrentSpeakerIndex],
        partialText: type === 'partial' ? chunk.text : undefined,
        text:
          type === 'final'
            ? `${items[lastItemWithCurrentSpeakerIndex].text ?? ''}${chunk.text}`
            : items[lastItemWithCurrentSpeakerIndex].text,
        endTime: chunk.endTime,
      };
    } else {
      let i = items.length - 1;
      do {
        const item = items.at(i);

        // If this chunk starts after the current item does, keep looking
        if (item && item.startTime > chunk.startTime) {
          i--;
          continue;
        }

        items.splice(i + 1, 0, {
          speaker: chunk.speaker,
          partialText: type === 'partial' ? chunk.text : undefined,
          text: type === 'final' ? chunk.text : undefined,
          startTime: chunk.startTime,
          endTime: chunk.endTime,
        });
        break;
      } while (i >= 0);
    }

    this._items = items;
    this.dispatchTypedEvent('change', new Event('change'));
  }

  clearTranscript() {
    this._items = [];
    this.dispatchTypedEvent('change', new Event('change'));
  }
}
