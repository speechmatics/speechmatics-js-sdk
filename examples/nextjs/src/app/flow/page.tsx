import { fetchCredentials } from '@/lib/fetch-credentials';
import Component from './Component';
import { fetchPersonas, FlowProvider } from '@speechmatics/flow-client-react';

export default async function Home() {
  // Credentials here are being fetched when rendering the server component.
  // You could instead define an API action to request it on the fly.
  const creds = await fetchCredentials();
  const personas = await fetchPersonas();

  return (
    <FlowProvider appId="nextjs-example">
      <Component jwt={creds.key_value} personas={personas} />
    </FlowProvider>
  );
}
