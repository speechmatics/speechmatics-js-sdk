'use client';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { useFlowEventListener } from '@speechmatics/flow-client-react';
import { ErrorFallback } from './ErrorFallback';
import { useEffect, useRef } from 'react';
import Card from './Card';
import TranscriptManager from '@/lib/transcript-manager';
import { useTranscriptManager } from '@/hooks/useTranscriptManager';
import type { TranscriptGroup } from '@/lib/transcript-types';
import { AudioVisualizer } from './AudioVisualizer';
import {
  usePCMAudioPlayer,
  usePCMAudioPlayerContext,
} from '@speechmatics/web-pcm-player-react';
import {
  usePCMAudioRecorder,
  usePCMAudioRecorderContext,
} from '@speechmatics/browser-audio-input-react';

export function TranscriptView() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Component />
    </ErrorBoundary>
  );
}

function Component() {
  const { showBoundary } = useErrorBoundary();
  const transcriptGroups = useTranscriptManager();

  // Show error boundary on both socket errors and error messages from server
  useFlowEventListener('message', ({ data }) => {
    if (data.message === 'Error') {
      showBoundary(data);
    }
  });

  useFlowEventListener('socketError', (e) => {
    showBoundary(e);
  });

  return (
    <Card heading="Output">
      <TranscriptContainer transcripts={transcriptGroups} />
    </Card>
  );
}

const TranscriptContainer = ({
  transcripts,
}: { transcripts: TranscriptGroup[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (scrollRef.current) {
      const element = scrollRef.current;
      element.scrollTop = element.scrollHeight;
    }
  });

  const speakerAnalyser = usePCMAudioRecorderContext().analyser;
  const agentAudioAnalsyser = usePCMAudioPlayerContext().analyser;

  const lastSpeakerBlockIndex = transcripts.findLastIndex(
    (t) => t.type === 'speaker',
  );
  const lastAgentBlockIndex = transcripts.findLastIndex(
    (t) => t.type === 'agent',
  );

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto"
      style={{
        scrollBehavior: 'smooth',
        height: '300px',
      }}
    >
      {transcripts.map((group, i) => (
        <div
          key={`${group.type}-${
            group.type === 'agent'
              ? group.data[0].startTime
              : group.data[0].startTime
          }-${group.type === 'speaker' ? group.speaker : 'agent'}`}
          className="mb-2 animate-fade-in"
        >
          {group.type === 'speaker' ? (
            <div className="flex flex-col ">
              <div className="flex gap-2 items-center space-x-2">
                <span className="text-sm font-semibold text-gray-600">
                  {group.speaker}
                </span>
                {i === lastSpeakerBlockIndex && (
                  <AudioVisualizer analyser={speakerAnalyser} />
                )}
              </div>
              <p className="text-lg">
                {TranscriptManager.wordsToText(group.data)}
              </p>
            </div>
          ) : (
            <div className="flex flex-col bg-blue-50 p-2 rounded">
              <div className="flex gap-2 items-center space-x-2">
                <span className="text-sm font-semibold text-blue-600">
                  Agent
                </span>
                {i === lastAgentBlockIndex && (
                  <AudioVisualizer analyser={agentAudioAnalsyser} />
                )}
              </div>
              {group.data.map((response, index) => (
                <p key={`${response.startTime}-${index}`} className="text-lg">
                  {response.text}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
