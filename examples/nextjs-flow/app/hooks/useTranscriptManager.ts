import { useFlowEventListener } from '@speechmatics/flow-client-react';
import { useState, useRef, useEffect } from 'react';
import { type TranscriptGroup, TranscriptManager } from './newPartials';

// Custom hook to manage TranscriptManager instance
export function useTranscriptManager() {
  const [transcriptGroups, setTranscriptGroups] = useState<TranscriptGroup[]>(
    [],
  );
  const managerRef = useRef<TranscriptManager | null>(null);

  useEffect(() => {
    const manager = new TranscriptManager();
    managerRef.current = manager;

    const handleUpdate = (event: CustomEvent<TranscriptGroup[]>) => {
      setTranscriptGroups(event.detail);
    };

    manager.addEventListener('update', handleUpdate as EventListener);
    return () => {
      manager.removeEventListener('update', handleUpdate as EventListener);
      managerRef.current = null;
    };
  }, []);

  useFlowEventListener('message', ({ data }) => {
    if (managerRef.current) {
      managerRef.current.handleMessage(data);
    }
  });

  return transcriptGroups;
}
