import { TypedEventTarget } from 'typescript-event-target';

export class InputAudioEvent extends Event {
  constructor(public readonly data: Float32Array) {
    super('audio');
  }
}

interface PcmRecorderEventMap {
  recordingStarted: Event;
  recordingStopped: Event;
  audio: InputAudioEvent;
}

export type StartRecordingOptions = {
  deviceId?: string;
  recordingOptions?: MediaTrackConstraints;
} & ({ audioContext: AudioContext } | { sampleRate: number });

export class PcmRecorder extends TypedEventTarget<PcmRecorderEventMap> {
  constructor(readonly workletScriptURL: string) {
    super();
  }

  private _mediaStream: MediaStream | undefined;
  public get mediaStream() {
    return this._mediaStream;
  }

  private selfManagedAudioContext: AudioContext | undefined = undefined;

  get isRecording() {
    return this._mediaStream?.active ?? false;
  }

  async startRecording(options: StartRecordingOptions) {
    let audioContext: AudioContext;

    if ('audioContext' in options) {
      audioContext = options.audioContext;
    } else {
      try {
        audioContext = new AudioContext({ sampleRate: options.sampleRate });
        this.selfManagedAudioContext = audioContext;
      } catch (err) {
        throw new AudioContextCreationError(err);
      }
    }

    try {
      await audioContext.audioWorklet.addModule(this.workletScriptURL);
    } catch (err) {
      throw new AudioModuleRegistrationError(this.workletScriptURL, err);
    }

    const constraints = {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      ...(options.recordingOptions ?? {}),
    };

    this._mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: options.deviceId,
        ...constraints,
      },
    });

    const input = audioContext.createMediaStreamSource(this._mediaStream);
    const processor = new AudioWorkletNode(audioContext, 'pcm-audio-processor');

    processor.port.onmessage = (event) => {
      const inputBuffer = event.data;
      this.dispatchTypedEvent('audio', new InputAudioEvent(inputBuffer));
    };

    input.connect(processor);
    processor.connect(audioContext.destination);

    this.dispatchTypedEvent('recordingStarted', new Event('recordingStarted'));
  }

  stopRecording() {
    if (this._mediaStream) {
      for (const track of this._mediaStream.getTracks()) {
        track.stop();
      }
      this._mediaStream = undefined;

      this.selfManagedAudioContext?.close();
      this.selfManagedAudioContext = undefined;

      this.dispatchTypedEvent(
        'recordingStopped',
        new Event('recordingStopped'),
      );
    }
  }
}

export class AudioModuleRegistrationError extends Error {
  constructor(moduleUrl: string, error: unknown) {
    super(`Failed to register module from ${moduleUrl}`, { cause: error });
    this.name = 'AudioModuleRegistrationError';
  }
}

export class AudioContextCreationError extends Error {
  constructor(error: unknown) {
    super('Failed to create audio context', { cause: error });
    this.name = 'AudioContextCreationError';
  }
}
