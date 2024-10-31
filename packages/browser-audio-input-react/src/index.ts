import { useCallback, useSyncExternalStore } from 'react';
import { getAudioDevicesStore } from '@speechmatics/browser-audio-input';

// Here we subscribe to the device state browser event
// When devices change, the getDevices callback is invoked
function subscribeDevices(callback: () => void) {
  const audioDevices = getAudioDevicesStore();
  audioDevices.addEventListener('changeDevices', callback);
  return () => {
    audioDevices.removeEventListener('changeDevices', callback);
  };
}
const getDevices = () => getAudioDevicesStore().devices;

function useAudioDeviceList() {
  return useSyncExternalStore(subscribeDevices, getDevices, getDevices);
}

// Here we subscribe to the user's provided permissions
// When the permission state changes, the useAudioDevices hook is called
function subscribePermissionState(callback: () => void) {
  const audioDevices = getAudioDevicesStore();
  audioDevices.addEventListener('changePermissions', callback);
  return () => {
    audioDevices.removeEventListener('changePermissions', callback);
  };
}
const getPermissionState = () => getAudioDevicesStore().permissionState;
function useAudioPermissionState() {
  return useSyncExternalStore(
    subscribePermissionState,
    getPermissionState,
    getPermissionState,
  );
}

function usePromptAudioPermission() {
  return useCallback(async () => {
    await getAudioDevicesStore().promptPermissions();
  }, []);
}

export type AudioDevices =
  | { permissionState: 'prompt'; promptPermissions: () => void }
  | { permissionState: 'prompting' }
  | {
      permissionState: 'granted';
      deviceList: ReadonlyArray<MediaDeviceInfo>;
    }
  | { permissionState: 'denied' };

export function useAudioDevices(): AudioDevices {
  const permissionState = useAudioPermissionState();
  const promptPermissions = usePromptAudioPermission();
  const deviceList = useAudioDeviceList();

  switch (permissionState) {
    case 'prompt':
      return {
        permissionState,
        promptPermissions,
      };
    case 'granted':
      return {
        permissionState,
        deviceList,
      };
    case 'prompting':
    case 'denied':
      return {
        permissionState,
      };
    default:
      permissionState satisfies never;
      throw new Error(`Unexpected permission state: ${permissionState}`);
  }
}
