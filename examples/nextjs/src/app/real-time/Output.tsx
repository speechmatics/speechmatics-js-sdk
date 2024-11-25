import { useState } from 'react';
import { useRealtimeEventListener } from '@speechmatics/real-time-client-react';

export function Output() {
  const transcription = useState('');
  useRealtimeEventListener('receiveMessage', ({ data }) => {
    if (data.message === 'AddTranscript') {
      console.log(data.results);
    }
  });
  return null;
}
