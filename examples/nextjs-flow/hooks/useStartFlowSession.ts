import { getJWT } from '@/app/actions';
import { useFlow } from '@speechmatics/flow-client-react';
import { useCallback } from 'react';

export function useStartFlowSession() {
  const { startConversation } = useFlow();

  return useCallback(
    async ({
      personaId,
      recordingSampleRate,
    }: { personaId: string; recordingSampleRate: number }) => {
      const jwt = await getJWT('flow');

      await startConversation(jwt, {
        config: {
          template_id: personaId,
          template_variables: {
            // We can set up any template variables here
          },
        },
        audioFormat: {
          type: 'raw',
          encoding: 'pcm_f32le',
          sample_rate: recordingSampleRate,
        },
      });
    },
    [startConversation],
  );
}
