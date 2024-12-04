import type {
  AddPartialTranscriptMessage,
  AddTranscriptMessage,
  ResponseCompletedMessage,
  ResponseStartedMessage,
  ResponseInterruptedMessage,
} from '@speechmatics/flow-client-react';
import { useReducer } from 'react';

export function useFlowTranscript() {
  const [state, dispatch] = useReducer(messagesReducer, []);

  return {
    messages: state,
    handleEvent: dispatch,
  };
}

export type Message = {
  readonly text?: string;
  readonly partialText?: string;
  readonly speaker: string;
  readonly startTime: number;
} & (
  | { readonly agent: true; readonly endTime?: number }
  // Only agent messages have undefined end times
  | { readonly agent: false; readonly endTime: number }
);

type IncomingEvent =
  | AddTranscriptMessage
  | AddPartialTranscriptMessage
  | ResponseStartedMessage
  | ResponseCompletedMessage
  | ResponseInterruptedMessage;

export function messagesReducer(
  oldMessages: ReadonlyArray<Message>,
  event: IncomingEvent,
) {
  if (eventIsEmpty(event)) {
    return oldMessages;
  }

  const messages = [...oldMessages];

  debugString(event);

  switch (event.message) {
    case 'AddPartialTranscript':
    case 'AddTranscript': {
      const isPartial = event.message === 'AddPartialTranscript';
      const speaker = event.results[0]?.alternatives?.[0]?.speaker ?? 'Unknown';

      const lastMessageBeforeNow = messages.findLast(
        (m) => m.startTime <= event.metadata.start_time,
      );

      const message =
        lastMessageBeforeNow?.speaker === speaker
          ? lastMessageBeforeNow
          : {
              speaker,
              partialText: isPartial ? event.metadata.transcript : undefined,
              text: !isPartial ? event.metadata.transcript : undefined,
              startTime: event.metadata.start_time,
              endTime: event.metadata.end_time,
              agent: false,
            };

      const index = messages.indexOf(message);
      if (index < 0) {
        messages.push(message);
      } else {
        let text = message.text ?? '';
        if (!isPartial) {
          text += ` ${event.metadata.transcript}`;
        }
        messages[index] = {
          ...message,
          partialText: isPartial ? event.metadata.transcript : undefined,
          text,
          startTime: event.metadata.start_time,
          endTime: event.metadata.end_time,
        };
      }

      break;
    }
    case 'ResponseStarted': {
      const lastMessage = messages.at(-1);
      const message = lastMessage?.agent
        ? lastMessage
        : {
            speaker: 'agent',
            partialText: event.content,
            startTime: event.start_time,
            agent: true as const,
          };

      if (messages.indexOf(message) < 0) {
        messages.push(message);
      } else {
        messages[messages.indexOf(message)] = {
          ...message,
          partialText: event.content,
        };
      }

      break;
    }
    case 'ResponseCompleted':
    case 'ResponseInterrupted': {
      const lastAgentMessage = messages.findLast((m) => m.agent);
      if (!lastAgentMessage) {
        throw new Error('No existing agent message to complete');
      }

      messages[messages.indexOf(lastAgentMessage)] = {
        ...lastAgentMessage,
        partialText: undefined,
        endTime: event.end_time,
        text: `${lastAgentMessage.text ?? ''}${event.content} `,
      };

      break;
    }
    default:
      event satisfies never;
      throw new Error('Unexpected input event');
  }

  messages.sort((a, b) => a.startTime - b.startTime);
  return messages;
}

function eventIsEmpty(event: IncomingEvent): boolean {
  return (
    (event.message === 'AddPartialTranscript' ||
      event.message === 'AddTranscript') &&
    !event.results.length
  );
}

// https://stackoverflow.com/questions/3269434/whats-the-most-efficient-way-to-test-if-two-ranges-overlap
export function rangesOverlap(
  [a1, a2]: [number, number],
  [b1, b2]: [number, number],
) {
  return Math.max(a1, b1) <= Math.min(a2, b2);
}

function debugString(event: IncomingEvent) {
  switch (event.message) {
    case 'AddPartialTranscript':
      console.log(
        `%c${event.metadata.transcript}\t${event.metadata.start_time} - ${event.metadata.end_time}`,
        'color: gray;',
      );
      break;
    case 'AddTranscript':
      console.log(
        `${event.metadata.transcript}\t${event.metadata.start_time} - ${event.metadata.end_time}`,
      );
      break;
    case 'ResponseStarted':
      console.log(
        `%c${event.content}\t${event.start_time} - ???`,
        'color: green;',
      );
      break;
    case 'ResponseCompleted':
      console.log(
        `%c${event.content}\t${event.start_time} - ${event.end_time}`,
        'color: green;',
      );
      break;
    case 'ResponseInterrupted':
      console.log(
        `INTERRUPTION: %c${event.content}\t${event.start_time} - ${event.end_time}`,
        'color: red;',
      );
      break;
    default:
      event satisfies never;
      throw new Error('Unexpected input event');
  }
}
