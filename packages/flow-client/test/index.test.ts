import { test } from 'node:test';
import assert from 'node:assert';
import { WebSocket } from 'ws';

// @ts-ignore: We're polyfilling the global WebSocket object in the test.
// If we imported from '../dist' this would occur automatically,
// but importing from '../src' is slightly more convenient for development.
globalThis.WebSocket = WebSocket;

import { FlowClient } from '../src/client';

test('Flow Client Test', async (t) => {
  await t.test(
    'should reject if socket closes before conversation starts',
    async () => {
      const server = new WebSocket.Server({ port: 8080 });

      const client = new FlowClient('ws://localhost:8080', {
        appId: 'unit-test',
      });
      const connection = client.startConversation('jwt', {
        config: {
          template_id: 'template_id',
          template_variables: {},
        },
      });
      // End conversation immediately after socket opens
      client.addEventListener(
        'socketOpen',
        () => {
          client.endConversation();
          console.log('Closing server');
          server.close();
        },
        { once: true },
      );
      await assert.rejects(connection, {
        name: 'SpeechmaticsFlowError',
        type: 'SocketClosedPrematurely',
      });
    },
  );
});
