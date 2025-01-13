import { TypedEventTarget } from 'typescript-event-target';

const RECORDING_STARTED = 'recordingStarted';
const RECORDING_STOPPED = 'recordingStopped';
const AUDIO = 'audio';

export class InputAudioEvent extends Event {
  constructor(public readonly data: Float32Array) {
    super(AUDIO);
  }
}

interface PCMRecorderEventMap {
  [RECORDING_STARTED]: Event;
  [RECORDING_STOPPED]: Event;
  [AUDIO]: InputAudioEvent;
}

export type StartRecordingOptions = {
  deviceId?: string;
  recordingOptions?: MediaTrackConstraints;
  audioContext: AudioContext;
};

export class PCMRecorder extends TypedEventTarget<PCMRecorderEventMap> {
  constructor(readonly workletScriptURL: string) {
    super();
  }

  private mediaStream: MediaStream | undefined;
  private audioContext: AudioContext | undefined = undefined;
  private inputSourceNode: MediaStreamAudioSourceNode | undefined = undefined;
  private _analyser: AnalyserNode | undefined = undefined;

  get analyser() {
    return this._analyser;
  }

  get isRecording() {
    return this.mediaStream?.active ?? false;
  }

  async startRecording(options: StartRecordingOptions) {
    this.audioContext = options.audioContext;

    try {
      await this.audioContext.audioWorklet.addModule(this.workletScriptURL);
    } catch (err) {
      throw new AudioModuleRegistrationError(this.workletScriptURL, err);
    }

    const constraints = {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      ...(options.recordingOptions ?? {}),
    };

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: options.deviceId,
        ...constraints,
      },
    });

    this.inputSourceNode = this.audioContext.createMediaStreamSource(
      this.mediaStream,
    );
    const processor = new AudioWorkletNode(
      this.audioContext,
      'pcm-audio-processor',
    );

    processor.port.onmessage = (event) => {
      const inputBuffer = event.data;
      this.dispatchTypedEvent(AUDIO, new InputAudioEvent(inputBuffer));
    };

    this.inputSourceNode.connect(processor);
    processor.connect(this.audioContext.destination);

    this._analyser = this.audioContext.createAnalyser();
    this.inputSourceNode.connect(this._analyser);

    this.dispatchTypedEvent(RECORDING_STARTED, new Event(RECORDING_STARTED));
  }

  stopRecording() {
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.inputSourceNode?.disconnect();

      this.mediaStream = undefined;
      this.inputSourceNode = undefined;
      this._analyser = undefined;
      this.audioContext = undefined;

      this.dispatchTypedEvent(RECORDING_STOPPED, new Event(RECORDING_STOPPED));
    }
  }
}

export class AudioModuleRegistrationError extends Error {
  constructor(moduleUrl: string, error: unknown) {
    super(`Failed to register module from ${moduleUrl}`, { cause: error });
    this.name = 'AudioModuleRegistrationError';
  }
}
