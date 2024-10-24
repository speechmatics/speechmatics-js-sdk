import { fetchCredentials } from '@/lib/fetch-credentials';
import { Example } from '@/lib/Example';
import { fetchPersonas } from '@/lib/fetchPersonas';

export default async function Home() {
  // Credentials here are being fetched when rendering the server component.
  // You could instead define an API action to request it on the fly.
  const creds = await fetchCredentials();
  const personas = await fetchPersonas();

  return (
    <main className="container">
      <Example jwt={creds.key_value} personas={personas} />
    </main>
  );
}
