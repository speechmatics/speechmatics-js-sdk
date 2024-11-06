import { RealtimeTranscriptionProvider } from '@speechmatics/real-time-client-react';
import Component from './Component';

export default function Page() {
  return (
    <RealtimeTranscriptionProvider appId="nextjs-rt-example">
      <Component />
    </RealtimeTranscriptionProvider>
  );
}
