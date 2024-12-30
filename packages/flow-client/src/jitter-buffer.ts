import { TypedEventTarget } from 'typescript-event-target';

const FLUSH = 'flush';

export class FlushEvent extends Event {
  constructor(readonly data: Int16Array[]) {
    super(FLUSH);
  }
}

export class JitterBuffer extends TypedEventTarget<{ [FLUSH]: FlushEvent }> {
  private buffer: Int16Array[] = [];

  constructor(private readonly maxByteLength: number) {
    super();
  }

  get byteLength() {
    return this.buffer.reduce((sum, curr) => sum + curr.byteLength, 0);
  }

  enqueue(data: Int16Array) {
    this.buffer.push(data);
    if (this.byteLength >= this.maxByteLength) {
      this.flush();
    }
  }

  flush() {
    this.dispatchTypedEvent(FLUSH, new FlushEvent(this.buffer));
    this.buffer = [];
  }
}
