export async function fetchPersonas() {
  const resp = await fetch(
    'https://flow.api.speechmatics.com/v1/discovery/templates',
  );
  const json = await resp.json();
  return json.templates;
}
