const SAMPLE_RATE_48K = 48000;
const SAMPLE_RATE_44K = 44100;

export class AudioRecorder {
  streamBeingCaptured: MediaStream;
  mediaRecorder: MediaRecorder;
  checkingPermission: boolean = false;
  audioContext: AudioContext;
  mediaStreamSource: MediaStreamAudioSourceNode;
  scriptProcessor: ScriptProcessorNode;
  dataHandlerCallback?: (data: Float32Array) => void;
  onMicrophoneBlocked?: (err: any, open: boolean, denied: boolean) => void;
  onMicrophoneAllowed?: () => void;
  waitingOnMediaPermissions?: () => void;
  transactionInProgress: boolean = false;

  constructor(
    dataHandlerCallback: (data: Float32Array) => void,
    onMicrophoneBlocked: (err: any, opena: boolean, denied: boolean) => void,
    onMicrophoneAllowed: () => void,
    waitingOnMediaPermissions: () => void
  ) {
    this.dataHandlerCallback = dataHandlerCallback;
    this.onMicrophoneAllowed = onMicrophoneAllowed;
    this.onMicrophoneBlocked = onMicrophoneBlocked;
    this.waitingOnMediaPermissions = waitingOnMediaPermissions;
  }

  async startRecording() {
    console.log('AudioRecorder startRecording');
    const AudioContext = globalThis.window?.AudioContext;
    const sampleRate =
      globalThis.navigator?.userAgent.indexOf('Firefox') != -1 ? undefined : SAMPLE_RATE_48K;

    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && AudioContext)) {
      return Promise.reject(
        new Error(
          'AudioContext, mediaDevices API or getUserMedia methods are not supported in this browser.'
        )
      );
    }

    this.audioContext = new AudioContext({ sampleRate });
    if ((await this.getPermissions()) === 'denied') {
      this.onMicrophoneBlocked?.('Microphone permission denied', true, true);
      throw new Error('Microphone permission denied.');
    }
    // { audio: {deviceId: micDeviceId} }
    let audio: MediaTrackConstraintSet = { sampleRate };
    if (this.audioDeviceId) audio.deviceId = this.audioDeviceId;

    this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

    // this timeout gives the system a brief window to check if the user already has permission
    let checking = true;
    if (this.transactionInProgress) this.waitingOnMediaPermissions();
    this.transactionInProgress = true;

    setTimeout(() => {
      if (checking) this.waitingOnMediaPermissions();
      checking = false;
    }, 500);

    return navigator.mediaDevices
      .getUserMedia({ audio })
      .then(async (stream) => {
        // If we haven't already got devices, do it now in the background
        if (!this.devices.length) {
          this.getAudioInputs(false).catch((err) => console.log(err));
        }
        checking = false;

        const recorder = new MediaRecorder(stream);
        this.scriptProcessor.addEventListener('audioprocess', (ev: AudioProcessingEvent) => {
          // console.log('audioprocess', ev);
          this.dataHandlerCallback?.(ev.inputBuffer.getChannelData(0));
        });

        this.streamBeingCaptured = stream;
        this.onMicrophoneAllowed();
        return { sampleRate: this.audioContext.sampleRate };
      })
      .catch((err) => {
        this.onMicrophoneBlocked(err, checking, true);
        checking = false;
        throw err;
      });
  }

  async stopRecording() {
    // this.mediaRecorder?.stop();

    this.mediaStreamSource?.disconnect();
    this.scriptProcessor?.disconnect();

    this.stopStream();

    this.resetRecordingProperties();
  }

  private stopStream() {
    this.streamBeingCaptured?.getTracks().forEach((track) => track.stop()); //stop each one
  }

  private resetRecordingProperties() {
    this.mediaRecorder = null;
    this.streamBeingCaptured = null;
    this.mediaStreamSource = null;
    this.scriptProcessor = null;
  }

  async getPermissions() {
    if (!!navigator?.permissions) {
      return (
        navigator.permissions
          // @ts-ignore - ignore because microphone is not in the enum of name for all browsers
          ?.query({ name: 'microphone' })
          .then((result) => result.state)
          .catch((err) => {
            return 'prompt';
          })
      );
    }
    return 'prompt';
  }

  async getAudioInputs(openModal = true) {
    let success = true;
    if ((await this.getPermissions()) === 'denied')
      return this.onMicrophoneBlocked?.('', true, true);
    if (this.transactionInProgress && openModal) return this.waitingOnMediaPermissions();
    if (this.devices.length === 0 && (await this.getPermissions()) === 'prompt') {
      let checking = true;
      this.transactionInProgress = true;
      setTimeout(() => {
        checking && openModal && this.waitingOnMediaPermissions();
        checking = false;
      }, 500);
      success = await navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          checking = false;
          stream.getTracks().forEach((track) => track.stop());
          this.onMicrophoneAllowed();
          return true;
        })
        .catch((err) => {
          this.onMicrophoneBlocked?.(err, checking, true);
          checking = false;
          console.log(err);
          return false;
        });
    }

    if (!success) return null;

    return await navigator.mediaDevices.enumerateDevices().then((devices: MediaDeviceInfo[]) => {
      const filtered = devices.filter((device: MediaDeviceInfo) => {
        return device.kind == 'audioinput';
      });

      // If labels are null, try opening streams to get labels (this is a Firefox issue)
      if (!filtered[0].label) {
        return this.getAudioInputsOpenStreams();
      }

      this.devices = filtered;

      if (!this.audioDeviceId) this.audioDeviceId = filtered[0].deviceId;

      return filtered;
    });
  }

  // NOTE: this function opens streams as Firefox only allows read access to open streams
  // - we do this just to populate the streams list and then close them
  async getAudioInputsOpenStreams() {
    let success = true;
    // get and open streams
    if (this.devices.length === 0) {
      success = await navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          stream.getAudioTracks().forEach((track) => (track.enabled = true));
          this.onMicrophoneAllowed();
          return true;
        })
        .catch((err) => {
          console.log(err);
          this.onMicrophoneBlocked?.(err, true, true);
          return false;
        });
    }

    if (!success) return null;

    // actually enumerate devices
    let filtered = await navigator.mediaDevices
      .enumerateDevices()
      .then((devices: MediaDeviceInfo[]) => {
        const filtered = devices.filter((device: MediaDeviceInfo) => {
          return device.kind == 'audioinput';
        });

        this.devices = filtered;

        if (!this.audioDeviceId) this.audioDeviceId = filtered[0].deviceId;

        return filtered;
      });

    // Close the audio streams
    await navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    return filtered;
  }

  devices: MediaDeviceInfo[] = [];

  private _audioDeviceId: string;
  get audioDeviceId(): string {
    return this._audioDeviceId;
  }
  set audioDeviceId(value: string) {
    this._audioDeviceId = value;
  }

  getAudioInputName() {
    return this.devices?.find((dev) => dev.deviceId == this.audioDeviceId)?.label;
  }
}

export default AudioRecorder;
