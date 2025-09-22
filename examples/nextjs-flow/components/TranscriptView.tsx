'use client';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { useFlowEventListener } from '@speechmatics/flow-client-react';
import { ErrorFallback } from './ErrorFallback';
import { useEffect, useRef } from 'react';
import {
  useFlowTranscript,
  wordsToText,
  type TranscriptGroup,
  transcriptGroupKey,
} from '@speechmatics/use-flow-transcript';
import { AudioVisualizer } from './AudioVisualizer';
import { usePCMAudioPlayerContext } from '@speechmatics/web-pcm-player-react';
import { usePCMAudioRecorderContext } from '@speechmatics/browser-audio-input-react';

export function TranscriptView() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Component />
    </ErrorBoundary>
  );
}

function Component() {
  const { showBoundary } = useErrorBoundary();
  const transcriptGroups = useFlowTranscript();

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
    <div className="card card-border shadow-md h-full overflow-y-auto">
      <div className="h-full card-body min-h-0">
        <div className="card-title">
          <h3>Transcript</h3>
        </div>
        <div className="flex w-full justify-center">
          <AudioVisualizer analyser={usePCMAudioPlayerContext().analyser} />
        </div>
        <TranscriptContainer transcripts={transcriptGroups} />
      </div>
    </div>
  );
}

export const TranscriptContainer = ({
  transcripts,
  showVisualizers = false,
}: { transcripts: TranscriptGroup[]; showVisualizers?: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (scrollRef.current) {
      const element = scrollRef.current;
      element.scrollTop = element.scrollHeight;
    }
  });

  const lastSpeakerBlockIndex = transcripts.findLastIndex(
    (t) => t.type === 'speaker',
  );
  const lastAgentBlockIndex = transcripts.findLastIndex(
    (t) => t.type === 'agent',
  );

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto min-h-0"
      style={{
        scrollBehavior: 'smooth',
      }}
    >
      {transcripts.map((group, i) => (
        <div
          key={transcriptGroupKey(group)}
          className={`animate-fade-in chat ${group.type === 'agent' ? 'chat-start' : 'chat-end'}`}
        >
          {group.type === 'speaker' ? (
            <div className="flex flex-col chat-bubble">
              <div className="flex gap-2 items-center space-x-2">
                <span className="text-sm font-semibold">{group.speaker}</span>
                {showVisualizers && i === lastSpeakerBlockIndex && (
                  <SpeakerAudioVisualizer />
                )}
              </div>
              <p className="text-lg">{wordsToText(group.data)}</p>
            </div>
          ) : (
            <div className="chat-bubble  flex flex-col p-2">
              <div className="flex gap-2 items-center space-x-2">
                <span className="text-sm font-semibold">Agent</span>
                {showVisualizers && i === lastAgentBlockIndex && (
                  <AgentAudioVisualizer />
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

function AgentAudioVisualizer() {
  const agentAudioAnalsyser = usePCMAudioPlayerContext().analyser;
  return <AudioVisualizer analyser={agentAudioAnalsyser} />;
}

function SpeakerAudioVisualizer() {
  const speakerAnalyser = usePCMAudioRecorderContext().analyser;
  return <AudioVisualizer analyser={speakerAnalyser} />;
}
