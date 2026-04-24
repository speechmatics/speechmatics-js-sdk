import { TypedEventTarget } from 'typescript-event-target';

const VOLUME_CHANGE = 'volumeChange';

export class VolumeChangeEvent extends Event {
  constructor(public volume: number) {
    super(VOLUME_CHANGE);
  }
}

export class PCMPlayer extends TypedEventTarget<{
  [VOLUME_CHANGE]: VolumeChangeEvent;
}> {
  private playbackTime = 0;
  private gainNode: GainNode;
  private _analyser: AnalyserNode;
  private scheduledSources: AudioBufferSourceNode[] = [];

  constructor(private audioContext: AudioContext) {
    super();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this._analyser = this.audioContext.createAnalyser();
    this.gainNode.connect(this._analyser);
  }

  playAudio(data: Int16Array | Float32Array) {
    if (this.audioContext.state !== 'running') {
      console.warn(`Audio context is in ${this.audioContext.state} state`);
      return;
    }

    const float32Array =
      data instanceof Int16Array ? pcm16ToFloat32(data) : data;
    const audioBuffer = this.audioContext.createBuffer(
      1,
      float32Array.length,
      this.audioContext.sampleRate,
    );

    audioBuffer.copyToChannel(float32Array, 0);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const currentTime = this.audioContext.currentTime;
    if (this.playbackTime < currentTime) {
      this.playbackTime = currentTime;
    }

    source.connect(this.gainNode);
    source.start(this.playbackTime);
    this.scheduledSources.push(source);
    source.onended = () => {
      const index = this.scheduledSources.indexOf(source);
      if (index > -1) this.scheduledSources.splice(index, 1);
    };

    this.playbackTime += audioBuffer.duration;
  }

  get volumePercentage() {
    return this.gainNode.gain.value * 100;
  }

  set volumePercentage(percentage: number) {
    this.gainNode.gain.value = percentage / 100;
    this.dispatchTypedEvent(VOLUME_CHANGE, new VolumeChangeEvent(percentage));
  }

  get analyser() {
    return this._analyser;
  }

  interrupt() {
    for (const source of this.scheduledSources) {
      source.stop();
    }
    this.scheduledSources = [];
    this.playbackTime = this.audioContext.currentTime;
  }
}

const pcm16ToFloat32 = (pcm16: Int16Array) => {
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768; // Convert PCM16 to Float32
  }
  return float32;
};
