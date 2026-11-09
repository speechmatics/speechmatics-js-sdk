import { test } from 'node:test';
import assert from 'node:assert';
import { WebSocket, WebSocketServer } from 'ws';

// @ts-ignore: Polyfill global WebSocket, as the node build does via rollup inject.
globalThis.WebSocket = WebSocket;

import {
  RealtimeClient,
  type RealtimeTranscriptionConfig,
} from '../src/client';
import type { RealtimeClientMessage } from '../models';

type FakeServer = {
  url: string;
  received: RealtimeClientMessage[];
  onConnection: (listener: () => void) => void;
  close: () => Promise<void>;
};

/**
 * Minimal fake RT server. Replies to StartRecognition with RecognitionStarted,
 * and sends EndOfTranscript once every expected channel has an EndOfChannel
 * (or on EndOfStream for single-channel sessions).
 */
async function startFakeServer(channelIds?: string[]): Promise<FakeServer> {
  const server = new WebSocketServer({ port: 0 });
  await new Promise<void>((r) => server.once('listening', r));
  const { port } = server.address() as { port: number };
  const received: RealtimeClientMessage[] = [];

  server.on('connection', (ws) => {
    const ended = new Set<string>();
    const send = (msg: object) => ws.send(JSON.stringify(msg));
    ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString()) as RealtimeClientMessage;
      received.push(msg);
      if (msg.message === 'StartRecognition') {
        send({
          message: 'RecognitionStarted',
          id: 'test',
          channel_ids: channelIds,
        });
      } else if (msg.message === 'AddChannelAudio') {
        const seq_no = received.filter(
          (m) => m.message === 'AddChannelAudio' && m.channel === msg.channel,
        ).length;
        send({ message: 'ChannelAudioAdded', channel: msg.channel, seq_no });
      } else if (msg.message === 'EndOfChannel') {
        ended.add(msg.channel);
        if (channelIds?.every((c) => ended.has(c))) {
          send({ message: 'EndOfTranscript' });
        }
      } else if (msg.message === 'EndOfStream') {
        send({ message: 'EndOfTranscript' });
      }
    });
  });

  return {
    url: `ws://localhost:${port}`,
    received,
    onConnection: (listener) => server.on('connection', listener),
    close: () => new Promise((r) => server.close(() => r())),
  };
}

const multichannelConfig: RealtimeTranscriptionConfig = {
  audio_format: { type: 'raw', encoding: 'mulaw', sample_rate: 8000 },
  transcription_config: {
    language: 'en',
    diarization: 'channel',
    channel_diarization_labels: ['inbound', 'outbound'],
  },
};

test('RealtimeClient multichannel', async (t) => {
  await t.test('sends AddChannelAudio with base64 data', async () => {
    const server = await startFakeServer(['inbound', 'outbound']);
    const client = new RealtimeClient({ url: server.url });
    await client.start('jwt', multichannelConfig);

    client.sendChannelAudio('inbound', new Uint8Array([1, 2, 3]));
    client.sendChannelAudio('outbound', new Uint8Array([4, 5, 6, 7]).buffer);
    client.sendChannelAudio('inbound', 'AAEC'); // already base64

    await client.stopRecognition();
    await server.close();

    const audio = server.received.filter(
      (m) => m.message === 'AddChannelAudio',
    );
    assert.deepStrictEqual(audio, [
      { message: 'AddChannelAudio', channel: 'inbound', data: 'AQID' },
      { message: 'AddChannelAudio', channel: 'outbound', data: 'BAUGBw==' },
      { message: 'AddChannelAudio', channel: 'inbound', data: 'AAEC' },
    ]);
  });

  await t.test(
    'stopRecognition sends EndOfChannel per channel with sent counts, and no EndOfStream',
    async () => {
      const server = await startFakeServer(['inbound', 'outbound']);
      const client = new RealtimeClient({ url: server.url });
      await client.start('jwt', multichannelConfig);

      client.sendChannelAudio('inbound', 'AA==');
      client.sendChannelAudio('inbound', 'AA==');
      client.sendChannelAudio('outbound', 'AA==');

      await client.stopRecognition();
      await server.close();

      const ends = server.received.filter(
        (m) => m.message === 'EndOfChannel' || m.message === 'EndOfStream',
      );
      assert.deepStrictEqual(ends, [
        { message: 'EndOfChannel', channel: 'inbound', last_seq_no: 2 },
        { message: 'EndOfChannel', channel: 'outbound', last_seq_no: 1 },
      ]);
    },
  );

  await t.test('ends channels that never received audio', async () => {
    const server = await startFakeServer(['inbound', 'outbound']);
    const client = new RealtimeClient({ url: server.url });
    await client.start('jwt', multichannelConfig);

    client.sendChannelAudio('inbound', 'AA==');
    await client.stopRecognition();
    await server.close();

    const ends = server.received.filter((m) => m.message === 'EndOfChannel');
    assert.deepStrictEqual(ends, [
      { message: 'EndOfChannel', channel: 'inbound', last_seq_no: 1 },
      { message: 'EndOfChannel', channel: 'outbound', last_seq_no: 0 },
    ]);
  });

  await t.test(
    'endChannel ends a channel early; stopRecognition does not re-send it',
    async () => {
      const server = await startFakeServer(['inbound', 'outbound']);
      const client = new RealtimeClient({ url: server.url });
      await client.start('jwt', multichannelConfig);

      client.sendChannelAudio('inbound', 'AA==');
      client.endChannel('inbound');
      client.endChannel('inbound'); // no-op
      assert.throws(() => client.sendChannelAudio('inbound', 'AA=='), {
        name: 'SpeechmaticsRealtimeError',
      });

      client.sendChannelAudio('outbound', 'AA==');
      await client.stopRecognition();
      await server.close();

      const ends = server.received.filter((m) => m.message === 'EndOfChannel');
      assert.deepStrictEqual(ends, [
        { message: 'EndOfChannel', channel: 'inbound', last_seq_no: 1 },
        { message: 'EndOfChannel', channel: 'outbound', last_seq_no: 1 },
      ]);
    },
  );

  await t.test(
    'stopRecognition resolves if EndOfTranscript already arrived',
    async () => {
      const server = await startFakeServer(['inbound', 'outbound']);
      const client = new RealtimeClient({
        url: server.url,
        connectionTimeout: 500,
      });
      await client.start('jwt', multichannelConfig);

      const eot = new Promise<void>((resolve) =>
        client.addEventListener('receiveMessage', ({ data }) => {
          if (data.message === 'EndOfTranscript') resolve();
        }),
      );
      client.endChannel('inbound');
      client.endChannel('outbound');
      await eot;

      await client.stopRecognition();
      await server.close();
    },
  );

  await t.test('sendChannelAudio throws before the socket is open', () => {
    const client = new RealtimeClient();
    assert.throws(() => client.sendChannelAudio('inbound', 'AA=='), {
      name: 'SpeechmaticsRealtimeError',
    });
  });

  await t.test(
    'sendChannelAudio and endChannel throw in single-channel sessions',
    async () => {
      const server = await startFakeServer();
      const client = new RealtimeClient({ url: server.url });
      await client.start('jwt', { transcription_config: { language: 'en' } });

      assert.throws(() => client.sendChannelAudio('inbound', 'AA=='), {
        name: 'SpeechmaticsRealtimeError',
        message: /multichannel session/,
      });
      assert.throws(() => client.endChannel('inbound'), {
        name: 'SpeechmaticsRealtimeError',
        message: /multichannel session/,
      });

      await client.stopRecognition();
      await server.close();

      assert.ok(
        !server.received.some(
          (m) =>
            m.message === 'AddChannelAudio' || m.message === 'EndOfChannel',
        ),
      );
    },
  );

  await t.test('sendAudio throws in multichannel sessions', async () => {
    const server = await startFakeServer(['inbound', 'outbound']);
    const client = new RealtimeClient({ url: server.url });
    await client.start('jwt', multichannelConfig);

    assert.throws(() => client.sendAudio(new Uint8Array([1, 2, 3])), {
      name: 'SpeechmaticsRealtimeError',
      message: /sendChannelAudio/,
    });

    await client.stopRecognition();
    await server.close();
  });

  await t.test(
    'start rejects duplicate channel labels before connecting',
    async () => {
      const server = await startFakeServer(['a', 'b']);
      let connections = 0;
      server.onConnection(() => connections++);
      const client = new RealtimeClient({ url: server.url });

      await assert.rejects(
        client.start('jwt', {
          transcription_config: {
            language: 'en',
            diarization: 'channel',
            channel_diarization_labels: ['a', 'b', 'a'],
          },
        }),
        {
          name: 'SpeechmaticsRealtimeError',
          message: 'Channel labels must be unique. Duplicated: a',
        },
      );
      await server.close();
      assert.strictEqual(connections, 0);
    },
  );

  await t.test('single-channel sessions still send EndOfStream', async () => {
    const server = await startFakeServer();
    const client = new RealtimeClient({ url: server.url });
    await client.start('jwt', { transcription_config: { language: 'en' } });
    await client.stopRecognition();
    await server.close();

    const ends = server.received.filter(
      (m) => m.message === 'EndOfChannel' || m.message === 'EndOfStream',
    );
    assert.deepStrictEqual(ends, [{ message: 'EndOfStream', last_seq_no: 0 }]);
  });
});
