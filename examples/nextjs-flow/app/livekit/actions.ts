'use server';
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

    const persona = formData.get('persona')?.toString();

    const response = await fetch('http://localhost:8080/v1/flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(startMesasage(template, persona)),
    });

    const json = await response.json();

    if (response.status !== 200) {
      throw new Error(json.detail);
    }

    console.log(json);
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
  start_conversation: {
    message: 'StartConversation',
    conversation_config: {
      template_id: template,
      template_variables: {
        timezone: 'Europe/London',
        persona,
      },
    },
  },
});
