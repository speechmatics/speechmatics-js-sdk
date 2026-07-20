'use server';

import { createSpeechmaticsJWT } from '@speechmatics/auth';

export async function getJWT(type: 'flow' | 'rt') {
  const apiKey = process.env.SPEECHMATICS_API_KEY;
  if (!apiKey) {
    throw new Error('Please set the API_KEY environment variable');
  }

  return createSpeechmaticsJWT({ type, apiKey, ttl: 60 });
}
