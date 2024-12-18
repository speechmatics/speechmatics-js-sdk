import { TypedEventTarget } from 'typescript-event-target';

interface AudioInputDevicesEventMap {
  changeDevices: Event;
  changePermissions: Event;
}
export class AudioInputDevicesStore extends TypedEventTarget<AudioInputDevicesEventMap> {
  private _permissionState: PermissionState | 'prompting' = 'prompt';
  private _devices: MediaDeviceInfo[] = [];

  get permissionState() {
    return this._permissionState;
  }

  set permissionState(value: PermissionState | 'prompting') {
    this._permissionState = value;
    this.dispatchTypedEvent(
      'changePermissions',
      new Event('changePermissions'),
    );
  }

  get devices() {
    return this._devices;
  }
  set devices(devices) {
    if (devices !== this._devices) {
      this._devices = devices;
      this.dispatchTypedEvent('changeDevices', new Event('changeDevices'));
    }
  }

  constructor() {
    super();
    if (typeof window === 'undefined') return;

    this.updateDeviceList();
    navigator.mediaDevices.addEventListener('devicechange', () => {
      this.updateDeviceList();
    });

    // Link permissions API
    navigator.permissions
      // @ts-ignore: "microphone" isn't a supported PermissionName for all browsers
      .query({ name: 'microphone' })
      .then((permissionStatus) => {
        this.permissionState = permissionStatus.state;
        permissionStatus.addEventListener('change', () => {
          this.permissionState = permissionStatus.state;
        });
      })
      .catch((e) => {
        console.warn('browser does not support microphone permissions query');
      });

    // Whenever permissions are granted, update device list
    this.addEventListener('changePermissions', () => {
      if (this.permissionState === 'granted') {
        this.updateDeviceList();
      }
    });
  }

  async promptPermissions() {
    if (this.permissionState === 'prompt') {
      this.permissionState = 'prompting';
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        if (mediaStream) {
          this.permissionState = 'granted';
        }
      } catch (e) {
        this.permissionState = 'denied';
      }
    }
  }

  // updateDeviceList is used to handle device enumeration once permissions have been given
  private updateDeviceList = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const filtered = devices.filter((device) => {
      return device.kind === 'audioinput' && device.deviceId !== '';
    });
    this.devices = filtered;
  };
}

let audioDevicesStore: AudioInputDevicesStore | null = null;
export function getAudioDevicesStore() {
  audioDevicesStore ??= new AudioInputDevicesStore();
  return audioDevicesStore;
}
