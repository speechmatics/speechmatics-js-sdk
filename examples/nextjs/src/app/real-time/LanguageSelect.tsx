export async function LanguageSelect() {
  const resp = await fetch(
    'https://asr.api.speechmatics.com/v1/discovery/features',
  );
  // TODO figure out if there's an RT discovery endpoint
  const languages = (await resp.json()).batch.transcription[0]
    .languages as string[];

  const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });

  return (
    <label>
      Select language
      <select defaultValue="en">
        {languages.map((langCode) => (
          <option
            key={langCode}
            value={langCode}
            label={displayNames.of(langCode)}
          />
        ))}
      </select>
    </label>
  );
}
