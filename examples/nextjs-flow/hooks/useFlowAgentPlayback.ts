import {
  type AgentAudioEvent,
  useFlowEventListener,
} from '@speechmatics/flow-client-react';
import { usePCMAudioPlayerContext } from '@speechmatics/web-pcm-player-react';
import { useCallback } from 'react';

// Hook to play back audio received from the agent
export function useFlowAgentPlayback() {
  const { playAudio } = usePCMAudioPlayerContext();

  useFlowEventListener(
    'agentAudio',
    useCallback(
      (audio: AgentAudioEvent) => {
        playAudio(audio.data);
      },
      [playAudio],
    ),
  );
}
