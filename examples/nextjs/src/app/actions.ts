'use server';

import { createSpeechmaticsJWT } from '@speechmatics/auth';

export async function getJWT() {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('Please set the API_KEY environment variable');
  }

  return createSpeechmaticsJWT({ type: 'flow', apiKey, ttl: 60 });
}
