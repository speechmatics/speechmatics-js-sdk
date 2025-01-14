import {
  type FlowIncomingMessageEvent,
  useFlowEventListener,
} from '@speechmatics/flow-client-react';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { Partials, type Word, getWords } from './partials';

export type TranscriptGroup =
  | {
      type: 'speaker';
      speaker: string;
      data: Word[];
    }
  | {
      type: 'agent';
      data: AgentResponse[];
    };

export function transcriptGroupKey(transcriptGroup: TranscriptGroup) {
  return `${transcriptGroup.type === 'agent' ? 'agent' : transcriptGroup.speaker}-${transcriptGroup.data[0].startTime ?? 0}-${transcriptGroup.data.at(-1)?.endTime ?? '?'}`;
}

export function useFlowTranscript() {
  const sentences = useSentences();
  const agentResponses = useAgentResponses();

  return useMemo(() => {
    const sentencesAndResponses = [...sentences, ...agentResponses];
    sentencesAndResponses.sort((a, b) => {
      const startTimeA = 'agent' in a ? a.startTime : a[0].startTime;
      const startTimeB = 'agent' in b ? b.startTime : b[0].startTime;
      return startTimeA - startTimeB;
    });
    const allSorted = sentencesAndResponses.flat();

    return Array.from(
      (function* () {
        let currentGroup: TranscriptGroup | undefined = undefined;

        for (const wordOrResponse of allSorted) {
          if (!currentGroup) {
            currentGroup =
              'agent' in wordOrResponse
                ? {
                    type: 'agent',
                    data: [wordOrResponse],
                  }
                : {
                    type: 'speaker',
                    data: [wordOrResponse],
                    speaker: wordOrResponse.speaker,
                  };
            continue;
          }

          if (currentGroup.type === 'agent' && 'agent' in wordOrResponse) {
            currentGroup.data.push(wordOrResponse);
          } else if (
            currentGroup.type === 'speaker' &&
            wordOrResponse.speaker === currentGroup.speaker
          ) {
            if (!('agent' in wordOrResponse)) {
              currentGroup.data.push(wordOrResponse);
            }
          } else {
            yield currentGroup;
            currentGroup =
              'agent' in wordOrResponse
                ? {
                    type: 'agent',
                    data: [wordOrResponse],
                  }
                : {
                    type: 'speaker',
                    data: [wordOrResponse],
                    speaker: wordOrResponse.speaker,
                  };
          }
        }
        if (currentGroup) {
          yield currentGroup;
        }
      })(),
    );
  }, [sentences, agentResponses]);
}

function useSentences() {
  const finals = useFinals();
  const partials = usePartials();

  return useMemo(
    () =>
      Array.from(
        (function* () {
          let currentSentence: Word[] = [];
          for (const word of [...finals, ...partials]) {
            currentSentence.push(word);
            if (word.punctuation && word.eos) {
              yield currentSentence;
              currentSentence = [];
            }
          }
          if (currentSentence.length) yield currentSentence;
        })(),
      ),
    [finals, partials],
  );
}

function usePartials() {
  const [partials] = useState(() => new Partials());
  const [partialsData, setPartialsData] = useState<Word[]>([]);

  useFlowEventListener(
    'message',
    useCallback(
      ({ data }: FlowIncomingMessageEvent) => {
        if (
          data.message === 'AddPartialTranscript' ||
          data.message === 'AddTranscript'
        ) {
          partials.update(data);
          setPartialsData([...partials.partials]);
        }
      },
      [partials],
    ),
  );

  useEffect(() => {
    const handleChange = () => {
      setPartialsData([...partials.partials]);
    };
    partials.addEventListener('change', handleChange);
    return () => partials.removeEventListener('change', handleChange);
  }, [partials]);

  return partialsData;
}

function useFinals() {
  const [finals, setFinals] = useState<Word[]>([]);
  useFlowEventListener(
    'message',
    useCallback(({ data }: FlowIncomingMessageEvent) => {
      if (data.message === 'AddTranscript') {
        setFinals((f) => [...f, ...getWords(data)]);
      }
    }, []),
  );

  return finals;
}

interface AgentResponse {
  speaker: 'agent';
  agent: true;
  startTime: number;
  endTime?: number;
  text: string;
}

function useAgentResponses() {
  const [responses, setResponses] = useState<AgentResponse[]>([]);

  useFlowEventListener(
    'message',
    useCallback(({ data }: FlowIncomingMessageEvent) => {
      if (data.message === 'ResponseStarted') {
        setResponses((r) => [
          ...r,
          {
            speaker: 'agent',
            agent: true as const,
            startTime: data.start_time,
            text: data.content,
          },
        ]);
      }

      if (
        data.message === 'ResponseCompleted' ||
        data.message === 'ResponseInterrupted'
      ) {
        setResponses((oldResponses) => {
          const thisResponse = {
            speaker: 'agent' as const,
            agent: true as const,
            startTime: data.start_time,
            endTime: data.end_time,
            text: data.content,
          };
          const existingResponse = oldResponses.findLast(
            (r) => r.startTime === data.start_time,
          );
          if (existingResponse) {
            const updated = [...oldResponses];
            updated[oldResponses.indexOf(existingResponse)] = thisResponse;
            return updated;
          }
          return [...oldResponses, thisResponse];
        });
      }
    }, []),
  );

  return responses;
}
