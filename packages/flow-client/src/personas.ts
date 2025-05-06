interface Personas {
  [personaId: string]: {
    name: string;
    character: string;
    description: string;
    start_text: string[];
    avatar?: string;
  };
}

export async function fetchPersonas(): Promise<Personas> {
  const resp = await fetch(
    'https://flow.api.speechmatics.com/v1/discovery/templates',
  );
  const json = await resp.json();
  return json.templates;
}
