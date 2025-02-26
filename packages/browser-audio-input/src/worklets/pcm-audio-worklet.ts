class PCMAudioProcessor extends AudioWorkletProcessor {
  active = true;

  constructor() {
    super();
    this.port.onmessage = (e) => {
      if (e.data === 'stop') {
        this.active = false;
      }
    };
  }

  process(inputs: Float32Array[][]) {
    const input = inputs[0];

    if (input.length > 0) {
      const inputBuffer = input[0];
      this.port.postMessage(inputBuffer);
    }

    return this.active;
  }
}

registerProcessor('pcm-audio-processor', PCMAudioProcessor);
