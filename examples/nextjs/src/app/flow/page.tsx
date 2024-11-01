import { fetchPersonas, FlowProvider } from '@speechmatics/flow-client-react';
import Component from './Component';

export default async function Home() {
  const personas = await fetchPersonas();

  return (
    <FlowProvider appId="nextjs-example">
      <Component personas={personas} />
    </FlowProvider>
  );
}
