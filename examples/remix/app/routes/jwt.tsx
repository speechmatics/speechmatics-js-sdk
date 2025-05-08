import type { ActionFunctionArgs } from '@remix-run/node';
import { createSpeechmaticsJWT } from '@speechmatics/auth';

// Utility action route for getting new JWTs for either real-time or Flow APIs
export async function action({ request }: ActionFunctionArgs) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key!');
  }

  const type = (await request.formData()).get('type');
  if (type !== 'rt' && type !== 'flow') {
    throw new Error("Bad 'type' field (choose 'flow' or 'rt')");
  }

  const jwt = await createSpeechmaticsJWT({ type, apiKey });
  return { jwt };
}
