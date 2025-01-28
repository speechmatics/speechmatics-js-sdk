'use client';
import { useAudioDevices } from '@speechmatics/browser-audio-input-react';

export function MicrophoneSelect({ disabled }: { disabled?: boolean }) {
  const devices = useAudioDevices();

  switch (devices.permissionState) {
    case 'prompt':
      return (
        <Select
          label="Enable mic permissions"
          onClick={devices.promptPermissions}
          onKeyDown={devices.promptPermissions}
        />
      );
    case 'prompting':
      return <Select label="Enable mic permissions" aria-busy="true" />;
    case 'granted': {
      return (
        <Select label="Select audio device" name="deviceId" disabled={disabled}>
          {devices.deviceList.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
        </Select>
      );
    }
    case 'denied':
      return <Select label="Enable mic permissions" disabled />;
    default:
      devices satisfies never;
      return null;
  }
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children?: React.ReactNode;
}

export const Select = ({
  label,
  children,
  className,
  ...props
}: SelectProps) => (
  <label className="form-control w-full max-w-xs">
    <div className="label">
      <span className="font-semibold">{label}</span>
    </div>
    <select className={`select select-bordered ${className || ''}`} {...props}>
      {children}
    </select>
  </label>
);
