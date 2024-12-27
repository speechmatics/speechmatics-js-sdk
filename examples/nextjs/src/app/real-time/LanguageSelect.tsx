export function LanguageSelect({
  languages,
}: { languages: [code: string, displayName: string][] }) {
  return (
    <label>
      Select language
      <select defaultValue="en" name="language">
        {languages.map(([code, displayName]) => (
          <option key={code} value={code} label={displayName} />
        ))}
      </select>
    </label>
  );
}
