import { NodeWebSocketWrapper } from './node';
import WebSocket, { Server, RawData } from 'ws';

describe('NodeWebSocketWrapper', () => {
  let server: Server;
  let socketWrapper: NodeWebSocketWrapper;

  beforeAll(() => {
    server = new Server({ port: 1234 });
  });

  beforeEach(() => {
    socketWrapper = new NodeWebSocketWrapper();
  });

  afterAll(() => {
    server.close();
  });

  afterEach(async () => {
    await socketWrapper.disconnect();
  });

  test('should connect and disconnect', async () => {
    const connectPromise = socketWrapper.connect('ws://localhost:1234');

    let clientSocket: WebSocket;
    const serverConnected = new Promise((resolve) => {
      server.once('connection', (socket) => {
        clientSocket = socket;
        resolve(null);
      });
    });

    await Promise.all([serverConnected, connectPromise]);
    expect(socketWrapper.isOpen()).toBeTruthy();

    const disconnectPromise = socketWrapper.disconnect();
    const serverClosed = new Promise((resolve) => {
      clientSocket.once('close', () => {
        resolve(null);
      });
    });

    await serverClosed;
    expect(socketWrapper.isOpen()).toBeFalsy();
    await disconnectPromise;
  }, 10000);

  test('should send and receive messages', async () => {
    const connectPromise = socketWrapper.connect('ws://localhost:1234');

    let clientSocket: WebSocket | null = null;
    const serverConnected = new Promise((resolve) => {
      server.once('connection', (socket) => {
        clientSocket = socket;
        resolve(null);
      });
    });

    await Promise.all([serverConnected, connectPromise]);

    const message = { message: 'test-message' };
    socketWrapper.sendMessage(JSON.stringify(message));

    const receivedMessage = await new Promise<RawData>((resolve) => {
      clientSocket?.once('message', (data) => {
        resolve(data);
      });
    });

    expect(receivedMessage.toString()).toEqual(JSON.stringify(message));

    const messageListener = jest.fn();
    socketWrapper.onMessage = messageListener;

    if (clientSocket !== null)
      (clientSocket as WebSocket).send(JSON.stringify(message));
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(messageListener).toHaveBeenCalledWith(message);
  });
});
