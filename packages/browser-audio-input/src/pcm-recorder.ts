import { TypedEventTarget } from 'typescript-event-target';

const RECORDING_STARTED = 'recordingStarted';
const RECORDING_STOPPED = 'recordingStopped';
const AUDIO = 'audio';
const MUTE = 'mute';
const UNMUTE = 'unmute';

export class InputAudioEvent extends Event {
  constructor(public readonly data: Float32Array) {
    super(AUDIO);
  }
}

export class MuteEvent extends Event {
  constructor() {
    super(MUTE);
  }
}

export class UnmuteEvent extends Event {
  constructor() {
    super(UNMUTE);
  }
}

interface PCMRecorderEventMap {
  [RECORDING_STARTED]: Event;
  [RECORDING_STOPPED]: Event;
  [AUDIO]: InputAudioEvent;
  [MUTE]: MuteEvent;
  [UNMUTE]: UnmuteEvent;
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
  private analyserNode: AnalyserNode | undefined = undefined;
  private workletProcessorNode: AudioWorkletNode | undefined = undefined;

  get analyser() {
    return this.analyserNode;
  }

  get isRecording() {
    return this.mediaStream?.active ?? false;
  }

  async startRecording(options: StartRecordingOptions) {
    this.audioContext = options.audioContext;

    try {
      if (this.audioContext.state !== 'running') {
        await this.audioContext.resume();
      }
    } catch (e) {
      throw new AudioContextResumeError(this.audioContext, { cause: e });
    }

    try {
      await this.audioContext.audioWorklet.addModule(this.workletScriptURL);
    } catch (err) {
      throw new AudioModuleRegistrationError(this.workletScriptURL, err);
    }

    const constraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
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
    this.workletProcessorNode = new AudioWorkletNode(
      this.audioContext,
      'pcm-audio-processor',
    );

    this.workletProcessorNode.port.onmessage = (event) => {
      const inputBuffer = event.data;
      this.dispatchTypedEvent(AUDIO, new InputAudioEvent(inputBuffer));
    };

    this.inputSourceNode.connect(this.workletProcessorNode);
    this.workletProcessorNode.connect(this.audioContext.destination);

    this.analyserNode = this.audioContext.createAnalyser();
    this.inputSourceNode.connect(this.analyserNode);

    this.dispatchTypedEvent(RECORDING_STARTED, new Event(RECORDING_STARTED));
  }

  mute() {
    if (!this.mediaStream) return;

    for (const track of this.mediaStream.getTracks()) {
      track.enabled = false;
    }

    this.dispatchTypedEvent(MUTE, new MuteEvent());
  }

  unmute() {
    if (!this.mediaStream) return;

    for (const track of this.mediaStream.getTracks()) {
      track.enabled = true;
    }

    this.dispatchTypedEvent(UNMUTE, new UnmuteEvent());
  }

  get isMuted() {
    return (
      this.mediaStream?.getAudioTracks().some((track) => !track.enabled) ??
      false
    );
  }

  stopRecording() {
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.inputSourceNode?.disconnect();
      this.workletProcessorNode?.port.postMessage('stop');
      this.workletProcessorNode?.disconnect();

      this.mediaStream = undefined;
      this.inputSourceNode = undefined;
      this.analyserNode = undefined;
      this.audioContext = undefined;
      this.workletProcessorNode = undefined;

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

export class AudioContextResumeError extends Error {
  constructor(audioContext: AudioContext, opts: ErrorOptions) {
    super(
      `Could not resume audio context. Found in ${audioContext.state} state`,
      opts,
    );
    this.name = 'AudioContextResumeError';
  }
}
