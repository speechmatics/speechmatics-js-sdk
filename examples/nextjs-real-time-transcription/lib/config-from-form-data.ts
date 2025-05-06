import type { RealtimeTranscriptionConfig } from '@speechmatics/real-time-client-react';

// TODO could have zod schemas here
export function configFromFormData(
  formData: FormData,
): RealtimeTranscriptionConfig {
  const language = formData.get('language')?.toString();

  if (!language) {
    throw new Error('Language is required');
  }

  return {
    transcription_config: {
      language,
      max_delay: 1,
      operating_point: 'enhanced',
      enable_partials: true,
    },
  };
}
