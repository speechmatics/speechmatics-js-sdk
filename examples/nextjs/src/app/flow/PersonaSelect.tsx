export function PersonaSelect({
  personas,
  disabled,
}: { personas: Record<string, { name: string }>; disabled?: boolean }) {
  return (
    <label>
      Select a persona
      <select disabled={disabled} name="personaId">
        {Object.entries(personas).map(([id, persona]) => (
          <option key={id} value={id} label={persona.name} />
        ))}
      </select>
    </label>
  );
}
