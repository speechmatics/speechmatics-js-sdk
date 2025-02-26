import { fetchPersonas, FlowProvider } from '@speechmatics/flow-client-react';
import { Controls } from '@/components/Controls';
import { Status } from '@/components/Status';
import { TranscriptView } from '@/components/TranscriptView';
import { AudioProvider } from '@/components/AudioProvider';

export default async function Home() {
  const personas = await fetchPersonas();

  return (
    <FlowProvider
      appId="nextjs-example"
      audioBufferingMs={500}
      websocketBinaryType="arraybuffer" // This is optional, but does lead to better audio performance, particularly on Firefox
    >
      <AudioProvider>
        <div className="container p-4 mx-auto max-xl:container">
          <h1 className="text-2xl font-bold">
            Speechmatics ❤️ NextJS Flow Example
          </h1>
          <div className="grid grid-cols-2 gap-4 my-6">
            <Controls personas={personas} />
            <Status />
          </div>
          <TranscriptView />
        </div>
      </AudioProvider>
    </FlowProvider>
  );
}
