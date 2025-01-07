'use client';

import { useAudioDevices } from '@speechmatics/browser-audio-input-react';

export function MicrophoneSelect({ disabled }: { disabled?: boolean }) {
  const devices = useAudioDevices();

  switch (devices.permissionState) {
    case 'prompt':
      return (
        <label>
          Enable mic permissions
          <select
            onClick={devices.promptPermissions}
            onKeyDown={devices.promptPermissions}
          />
        </label>
      );
    case 'prompting':
      return (
        <label>
          Enable mic permissions
          <select aria-busy="true" />
        </label>
      );
    case 'granted': {
      return (
        <label>
          Select audio device
          <select name="deviceId" disabled={disabled}>
            {devices.deviceList.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      );
    }
    case 'denied':
      return (
        <label>
          Microphone permission disabled
          <select disabled />
        </label>
      );
    default:
      devices satisfies never;
      return null;
  }
}
