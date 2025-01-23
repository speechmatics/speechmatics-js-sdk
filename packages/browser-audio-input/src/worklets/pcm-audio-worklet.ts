class PCMAudioProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][]) {
    const input = inputs[0];

    if (input.length > 0) {
      const inputBuffer = input[0];
      this.port.postMessage(inputBuffer);
    }

    return true;
  }
}

registerProcessor('pcm-audio-processor', PCMAudioProcessor);
