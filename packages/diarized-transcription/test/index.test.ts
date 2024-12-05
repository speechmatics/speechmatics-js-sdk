import { test, mock } from 'node:test';
import { expect } from 'chai';
import { DiarizedTranscription } from '../src';
import { speakerAgentConversation } from './fixtures/speaker-agent-conversation';

test('empty messages', () => {
  const diarizedTranscription = new DiarizedTranscription();
  const onChange = mock.fn();
  diarizedTranscription.addEventListener('change', onChange);

  let time = 0;

  while (time < 20) {
    diarizedTranscription.handleTranscriptionChunk('partial', {
      speaker: 'Unknown',
      text: '',
      startTime: time,
      endTime: time++,
    });
  }

  expect(onChange.mock.calls.length).equal(0);
  expect(diarizedTranscription.items.length).equal(0);
});

test('single speaker (partials)', () => {
  const diarizedTranscription = new DiarizedTranscription();
  const onChange = mock.fn();
  diarizedTranscription.addEventListener('change', onChange);

  let time = 0;
  let text = '';

  while (time < 20) {
    text += 'Hello! ';
    diarizedTranscription.handleTranscriptionChunk('partial', {
      speaker: 'Unknown',
      text,
      startTime: time,
      endTime: time++,
    });
  }

  expect(onChange.mock.calls.length).equal(20);
  expect(diarizedTranscription.items.length).equal(1);
  expect(diarizedTranscription.items[0].partialText).equal(
    'Hello! '.repeat(20),
  );
  expect(diarizedTranscription.items[0].text).undefined;
});

test("single speaker (partials and final's)", () => {
  const diarizedTranscription = new DiarizedTranscription();
  const onChange = mock.fn();
  diarizedTranscription.addEventListener('change', onChange);

  for (const event of speakerAgentConversation) {
    diarizedTranscription.handleTranscriptionChunk(event[0], event[1]);
  }

  expect(onChange.mock.calls.length).equal(speakerAgentConversation.length);
  expect(diarizedTranscription.items.length).equal(2);

  expect(diarizedTranscription.items[0].speaker).equal('S1');
  expect(diarizedTranscription.items[1].speaker).equal('agent');

  expect(diarizedTranscription.items[0].partialText).undefined;
  expect(diarizedTranscription.items[1].partialText).undefined;

  expect(diarizedTranscription.items[0].text).equal(
    // TODO: Figure out why we get extra spacing from SaaS on last punctuation.
    'Open the pod bay doors. Hal . ',
  );

  expect(diarizedTranscription.items[1].text).equal(
    "I'm sorry, I can't do that. But I'm here to help with anything else you need!",
  );
});
