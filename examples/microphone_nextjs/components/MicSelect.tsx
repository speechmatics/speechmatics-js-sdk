// MicSelect - component with a select menu for choosing mic inputs
type Option = {
  value: string;
  label: string;
};
interface MicSelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onClick: () => void;
  options: Option[];
  disabled: boolean;
}

const MicSelect: React.FunctionComponent<MicSelectProps> = ({
  onChange,
  onClick,
  options,
  value,
  disabled,
}) => {
  return options.length === 0 ? (
    <div
      onClick={onClick}
      onKeyUp={onClick}
      role='button'
      tabIndex={0}
      aria-label='Grant audio access'
    >
      <select disabled style={{ pointerEvents: 'none' }}>
        <option>Default</option>
      </select>
    </div>
  ) : (
    <select disabled={disabled} value={value} onChange={onChange}>
      {Object.entries(options).map(([key, value]) => (
        <option value={value.value} key={key}>
          {value.label}
        </option>
      ))}
    </select>
  );
};

export default MicSelect;
