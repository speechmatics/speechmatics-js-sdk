import { useCallback, useSyncExternalStore } from 'react';

const SAMPLE_RATE_48K = 48000;

// AudioRecorder is a class that wraps the MediaRecorder and device stream items
// It also provides methods for starting and stopping recording
export class AudioRecorder {
  stream: MediaStream;
  recorder: MediaRecorder;
  audioContext: AudioContext;
  mediaStreamSource: MediaStreamAudioSourceNode;
  dataHandlerCallback?: (data: Blob) => void;

  // The data handler callback is called when audio data is available
  // It is used to send data to the websocket
  constructor(dataHandlerCallback: (data: Blob) => void) {
    this.dataHandlerCallback = dataHandlerCallback;
  }

  async startRecording(deviceId: string) {
    const AudioContext = globalThis.window?.AudioContext;
    this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE_48K });

    // We first check mic permissions in case they are explicitly denied
    if ((await getPermissions()) === 'denied') {
      throw new Error('Microphone permission denied.');
    }

    // Here we set the sample rate and the deviceId that the user has selected
    // If deviceId isn't set, then we get a default device (which is expected behaviour)
    const audio: MediaTrackConstraintSet = {
      sampleRate: SAMPLE_RATE_48K,
      deviceId,
    };

    // Now we open and store the stream
    this.stream = await audioDevices.getUserMedia({ audio });

    // Instantiate the MediaRecorder instance
    this.recorder = new MediaRecorder(this.stream);

    // This is the event listening function that gets called when data is available
    this.recorder.ondataavailable = (event: BlobEvent) => {
      this.dataHandlerCallback?.(event.data);
    };

    // Start recording from the device
    // The number passed in indicates how frequently in milliseconds ondataavailable will be called
    this.recorder.start(500);

    // return the sample rate
    return { sampleRate: this.audioContext.sampleRate };
  }

  // stopRecording is called when the session ends
  // It shuts down the stream and recorder and sets all properties to null
  async stopRecording() {
    this.mediaStreamSource?.disconnect();
    this.recorder?.stop();
    this.stopStream();
    this.resetRecordingProperties();
  }

  // stopStream stops all tracks in the stream
  private stopStream() {
    this.stream?.getTracks().forEach((track) => track.stop()); //stop each one
  }

  // resetRecordingProperties makes sure we have a clean slate for the next session startup
  private resetRecordingProperties() {
    this.stream = null;
    this.mediaStreamSource = null;
  }
}

// this is a Class so that we can use EventTarget, but a singleton, as in the browser the active devices are external to React and can be managed app-wide.
class AudioDevices extends EventTarget {
  private busy = false;
  private _denied = false;
  private _devices: MediaDeviceInfo[] = [];

  get denied() {
    return this._denied;
  }
  set denied(denied) {
    if (denied !== this._denied) {
      this._denied = denied;
      this.dispatchEvent(new Event('changeDenied'));
    }
  }

  get devices() {
    return this._devices;
  }
  set devices(devices) {
    if (devices !== this._devices) {
      this._devices = devices;
      this.dispatchEvent(new Event('changeDevices'));
    }
  }

  constructor() {
    super();
    if (typeof window !== 'undefined') {
      this.updateDeviceList();
      // We don't need to unsubscribe as this class is a singleton
      navigator.mediaDevices.addEventListener('devicechange', () => {
        this.updateDeviceList();
      });
    }
  }

  // A wrapped getUserMedia that manages denied and device state
  public getUserMedia = async (constraints: MediaStreamConstraints) => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.denied = false;
    } catch (ex) {
      this.denied = true;
    }
    this.updateDeviceList();
    return stream;
  };

  // getDevices is used to prompt the user to give permission to audio inputs
  public getDevices = async () => {
    // We first check if the system is busy - we don't want to prompt for permissions if the user is already prompted for permissions
    if (!this.busy) {
      this.busy = true;
      await this.promptAudioInputs();
      this.busy = false;
    } else {
      console.warn('getDevices already in progress');
    }
  };

  // updateDeviceList is used to handle device enumeration once permissions have been given
  private updateDeviceList = async () => {
    const devices: MediaDeviceInfo[] =
      await navigator.mediaDevices.enumerateDevices();
    const filtered = devices.filter((device: MediaDeviceInfo) => {
      return (
        device.kind === 'audioinput' &&
        device.deviceId !== '' &&
        device.label !== ''
      );
    });
    this.devices = filtered;
  };

  private promptAudioInputs = async () => {
    const permissions = await getPermissions();
    if (permissions === 'denied') {
      this.denied = true;
      return;
    }

    // If permissions are prompt, we need to call getUserMedia to ask the user for permission
    if (permissions === 'prompt') {
      await this.getUserMedia({
        audio: true,
        video: false,
      });
    } else {
      this.updateDeviceList();
    }
  };
}
const audioDevices = new AudioDevices();

// Here we subscribe to the device state browser event
// When devices change, the getDevices callback is invoked
function subscribeDevices(callback) {
  audioDevices.addEventListener('changeDevices', callback);
  return () => {
    audioDevices.removeEventListener('changeDevices', callback);
  };
}
const getDevices = () => audioDevices.devices;
export function useAudioDevices() {
  return useSyncExternalStore(subscribeDevices, getDevices, getDevices);
}

// Here we subscribe to the user's provided permissions
// When the permission state changes, the useAudioDevices hook is called
function subscribeDenied(callback) {
  audioDevices.addEventListener('changeDenied', callback);
  return () => {
    audioDevices.removeEventListener('changeDenied', callback);
  };
}
const getDenied = () => audioDevices.denied;
export function useAudioDenied() {
  return useSyncExternalStore(subscribeDenied, getDenied, getDenied);
}

export function useRequestDevices() {
  return useCallback(() => audioDevices.getDevices(), []);
}

// getPermissions is used to access the permissions API
// This API is not fully supported in all browsers so we first check the availability of the API
async function getPermissions() {
  if (navigator?.permissions) {
    try {
      let result = await navigator.permissions
        // @ts-ignore - ignore because microphone is not in the enum of name for all browsers
        ?.query({ name: 'microphone' });
      return result.state;
    } catch (err) {
      return 'prompt';
    }
  }
  return 'prompt';
}
