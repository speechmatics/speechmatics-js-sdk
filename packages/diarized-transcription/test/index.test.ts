import { test, mock } from 'node:test';
import { expect } from 'chai';
import { SpeakerDiarizedTranscription } from '../src';
import { speakerAgentConversation } from './fixtures/speaker-agent-conversation';
import { crossTalkConversation } from './fixtures/cross-talk';
import { threeSpeakerConversation } from './fixtures/three-speaker-conversation';

test('empty messages', () => {
  const diarizedTranscription = new SpeakerDiarizedTranscription();
  const onChange = mock.fn();
  diarizedTranscription.addEventListener('change', onChange);

  let time = 0;

  while (time < 20) {
    diarizedTranscription.handleTranscriptionChunk('partial', {
      speaker: 'Unknown',
      text: '',
      startTime: 0,
      endTime: time++,
    });
  }

  expect(onChange.mock.calls.length).equal(0);
  expect(diarizedTranscription.items.length).equal(0);
});

test('single speaker (partials)', () => {
  const diarizedTranscription = new SpeakerDiarizedTranscription();
  const onChange = mock.fn();
  diarizedTranscription.addEventListener('change', onChange);

  let time = 0;
  let text = '';

  while (time < 20) {
    text += 'Hello! ';
    diarizedTranscription.handleTranscriptionChunk('partial', {
      speaker: 'Unknown',
      text,
      startTime: 0,
      endTime: ++time,
    });
  }

  expect(onChange.mock.calls.length).equal(20);
  expect(diarizedTranscription.items.length).equal(1);
  expect(diarizedTranscription.items[0].partialText).equal(
    'Hello! '.repeat(20),
  );
  expect(diarizedTranscription.items[0].text).undefined;
});

test('partials and finals', () => {
  const diarizedTranscription = new SpeakerDiarizedTranscription();
  const onChange = mock.fn();
  diarizedTranscription.addEventListener('change', onChange);

  for (const [type, chunk] of speakerAgentConversation) {
    diarizedTranscription.handleTranscriptionChunk(type, chunk);
  }

  // console.log(diarizedTranscription.items);

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

test('clear partials from all previous messages', () => {
  const diarizedTranscription = new SpeakerDiarizedTranscription();
  const onChange = mock.fn();
  diarizedTranscription.addEventListener('change', onChange);

  for (const [type, chunk] of crossTalkConversation) {
    diarizedTranscription.handleTranscriptionChunk(type, chunk);
  }

  expect(onChange.mock.calls.length).equal(crossTalkConversation.length);
  expect(diarizedTranscription.items.length).equal(7);

  for (const item of diarizedTranscription.items) {
    if (item !== diarizedTranscription.items.at(-1)) {
      expect(item.partialText).undefined;
    }
  }
});

test('3 speakers', () => {
  const diarizedTranscription = new SpeakerDiarizedTranscription();
  const onChange = mock.fn();
  diarizedTranscription.addEventListener('change', onChange);

  for (const [type, chunk] of threeSpeakerConversation) {
    diarizedTranscription.handleTranscriptionChunk(type, chunk);
  }

  expect(onChange.mock.calls.length).equal(threeSpeakerConversation.length);
  expect(diarizedTranscription.items.length).equal(4);
});
