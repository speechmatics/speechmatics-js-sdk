'use client';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { useFlowEventListener } from '@speechmatics/flow-client-react';
import { ErrorFallback } from './ErrorFallback';
import { useEffect, useRef } from 'react';
import Card from './Card';
import TranscriptManager from '@/lib/transcript-manager';
import { useTranscriptManager } from '@/hooks/useTranscriptManager';
import type { TranscriptGroup } from '@/lib/transcript-types';

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

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto"
      style={{
        scrollBehavior: 'smooth',
        height: '300px',
      }}
    >
      {transcripts.map((group) => (
        <div
          key={`${group.type}-${
            group.type === 'agent'
              ? group.data[0].startTime
              : group.data[0].startTime
          }-${group.type === 'speaker' ? group.speaker : 'agent'}`}
          className="mb-2 animate-fade-in"
        >
          {group.type === 'speaker' ? (
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-600">
                  {group.speaker}
                </span>
              </div>
              <p className="text-lg">
                {TranscriptManager.wordsToText(group.data)}
              </p>
            </div>
          ) : (
            <div className="flex flex-col bg-blue-50 p-2 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-blue-600">
                  Agent
                </span>
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
