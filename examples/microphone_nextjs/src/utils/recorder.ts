import { useEffect, useState } from "react";

const SAMPLE_RATE_48K = 48000;

// AudioRecorder is a class that wraps the MediaRecorder and device stream items
// It also provides methods for starting and stopping recording
export class AudioRecorder {
  stream: MediaStream;
  recorder: MediaRecorder;
  audioContext: AudioContext;
  mediaStreamSource: MediaStreamAudioSourceNode;
  dataHandlerCallback?: (data: Float32Array | Buffer) => void;

  // The data handler callback is called when audio data is available
  // It is used to send data to the websocket
  constructor(dataHandlerCallback: (data: Float32Array | Buffer) => void) {
    this.dataHandlerCallback = dataHandlerCallback;
  }

  async startRecording(deviceId: string) {
    const AudioContext = globalThis.window?.AudioContext;
    this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE_48K });

    // We first check mic permissions in case they are explicitly denied
    if ((await getPermissions()) === "denied") {
      throw new Error("Microphone permission denied.");
    }

    // Here we set the sample rate and the deviceId that the user has selected
    // If deviceId isn't set, then we get a default device (which is expected behaviour)
    let audio: MediaTrackConstraintSet = {
      sampleRate: SAMPLE_RATE_48K,
      deviceId,
    };

    // Now we open the stream
    let stream = await navigator.mediaDevices.getUserMedia({ audio });

    // Store the stream so we can close it on session end
    this.stream = stream;

    // Instantiate the MediaRecorder instance
    this.recorder = new MediaRecorder(stream);

    // This is the event listening function that gets called when data is available
    this.recorder.ondataavailable = (ev: BlobEvent) => {
      ev.data
        .arrayBuffer()
        .then((data) => this.dataHandlerCallback?.(Buffer.from(data)));
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

// useAudioDevices is the hook we'll use to get a list of all the user's microphones
// requested provides us with a convenient way to control whether we ask for permissions on load
// or on a user action e.g. clicking the select menu drop down
export function useAudioDevices(
  requested = false
): [MediaDeviceInfo[], boolean] {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [denied, setIsDenied] = useState<boolean>(false);

  // Create the async function to set devices
  const getDevices = async () => {
    try {
      const devs = await getAudioInputs();
      setDevices(devs);
    } catch (err) {
      setIsDenied(true);
    }
  };

  // Call the async method in useEffect
  useEffect(() => {
    if (requested) getDevices();
  }, [requested]);

  return [devices, denied];
}

// getAudioInputs enumerates all the available microphones
async function getAudioInputs(): Promise<MediaDeviceInfo[]> {
  // We start by checking permissions
  // If permissions are denied, throw an error
  if ((await getPermissions()) === "denied")
    throw new Error("Permissions denied");

  // If permissions are prompt, we need to call getUserMedia to ask the user for permission
  if ((await getPermissions()) === "prompt") {
    await navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
  }

  // now we have permissions, we attempt to get the audio devices
  let devices: MediaDeviceInfo[] =
    await navigator.mediaDevices.enumerateDevices();
  const filtered = devices.filter((device: MediaDeviceInfo) => {
    return device.kind == "audioinput";
  });
  // If labels are null, try opening streams to get labels
  // This is only for firefox where the device label can only be read when permission
  // has been given to access each device, not just audio devices in general
  if (!filtered[0].label) {
    return await getAudioInputsOpenStreams();
  }
  return filtered;
}

// This function opens streams as Firefox only allows read access to open streams
// We do this just to populate the streams list and then close them
async function getAudioInputsOpenStreams(): Promise<MediaDeviceInfo[]> {
  // get and open streams
  let stream: void | MediaStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  stream.getAudioTracks().forEach((track) => (track.enabled = true));

  // enumerate the devices and return them
  let devices: MediaDeviceInfo[] =
    await navigator.mediaDevices.enumerateDevices();
  const filtered = devices.filter((device: MediaDeviceInfo) => {
    return device.kind == "audioinput";
  });

  // Close the audio streams
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  stream.getTracks().forEach((track) => track.stop());
  return filtered;
}

// getPermissions is used to access the permissions API
// This API is not fully supported in all browsers so we first check the availability of the API
async function getPermissions() {
  if (!!navigator?.permissions) {
    return (
      navigator.permissions
        // @ts-ignore - ignore because microphone is not in the enum of name for all browsers
        ?.query({ name: "microphone" })
        .then((result) => result.state)
        .catch((err) => {
          return "prompt";
        })
    );
  }
  return "prompt";
}
