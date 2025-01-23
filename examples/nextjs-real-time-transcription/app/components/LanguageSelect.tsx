export function LanguageSelect({
  languages,
  disabled,
}: {
  languages: (readonly [code: string, displayName: string])[];
  disabled?: boolean;
}) {
  return (
    <label>
      Select language
      <select defaultValue="en" name="language" disabled={disabled}>
        {languages.map(([code, displayName]) => (
          <option key={code} value={code} label={displayName} />
        ))}
      </select>
    </label>
  );
}
