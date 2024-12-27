import { fetchPersonas } from '@speechmatics/flow-client-react';

export async function PersonaSelect() {
  const personas = await fetchPersonas();

  return (
    <label>
      Select a persona
      <select>
        {Object.entries(personas).map(([id, persona]) => (
          <option key={id} value={id} label={persona.name} />
        ))}
      </select>
    </label>
  );
}
