import { fetchPersonas } from '@speechmatics/flow-client-react';
import { Room } from './components/Room';

export default async function Index() {
  const personas = await fetchPersonas();

  console.log("FOO")
  return <Room personas={personas} />;
}
