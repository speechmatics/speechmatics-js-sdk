'use server';

import { createSpeechmaticsJWT } from '@speechmatics/auth';

export type StartLivekitResponse =
  | {
      success: true;
      livekitURL: string;
      livekitToken: string;
      sessionID: string;
    }
  | { success: false; error: string };

export async function start(formData: FormData): Promise<StartLivekitResponse> {
  try {
    const template = formData.get('template')?.toString();
    if (!template) {
      throw new Error('Missing template');
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error('Please set the API_KEY environment variable');
    }

    const jwt = await createSpeechmaticsJWT({
      type: 'flow',
      apiKey,
    });

    const persona = formData.get('persona')?.toString();

    const response = await fetch(
      'https://flow.api.speechmatics.com/v1/flow/livekit',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(startMesasage(template, persona)),
      },
    );

    if (response.status === 401) {
      throw new Error('Invalid JWT');
    }

    let json: Record<string, unknown>;

    try {
      json = await response.json();
    } catch (e) {
      throw new Error(
        `Failed to parse response with status ${response.status}`,
      );
    }

    if (response.status !== 200) {
      throw new Error(`Got ${response.status} response: ${json.detail}`);
    }

    return {
      success: true as const,
      livekitURL: json.url as string,
      livekitToken: json.token as string,
      sessionID: json.session_id as string,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false as const,
      error: 'Failed to start LiveKit session',
    };
  }
}

const startMesasage = (template: string, persona?: string) => ({
  message: 'StartConversation',
  conversation_config: {
    template_id: template,
    template_variables: {
      timezone: 'Europe/London',
      persona,
    },
  },
});
