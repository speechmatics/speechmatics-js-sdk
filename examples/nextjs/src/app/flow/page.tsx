import Component from './Component';
import { fetchPersonas, FlowProvider } from '@speechmatics/flow-client-react';
import { getSpeechmaticsJWT } from '@speechmatics/jwts';

export default async function Home() {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('Set `API_KEY` in .env file');
  }

  // Credentials here are being fetched when rendering the server component.
  // You could instead define an API action to request it on the fly.
  const jwt = await getSpeechmaticsJWT({
    type: 'flow',
    ttl: 120,
    apiKey,
  });
  const personas = await fetchPersonas();

  return (
    <FlowProvider appId="nextjs-example">
      <Component jwt={jwt} personas={personas} />
    </FlowProvider>
  );
}
