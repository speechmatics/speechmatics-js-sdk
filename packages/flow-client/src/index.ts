import { TypedEventTarget } from 'typescript-event-target';
import {
  AgentAudioEvent,
  type FlowClientEventMap,
  type FlowClientIncomingMessage,
  type FlowClientOutgoingMessage,
  type StartConversationMessage,
} from './events';

export interface FlowClientOptions {
  appId: string;
  audioBufferingMs?: number;
}

export class FlowClient extends TypedEventTarget<FlowClientEventMap> {
  public readonly appId: string;
  private readonly audioBufferingMs: number;

  private agentAudioQueue: Blob[] = [];

  constructor(
    public readonly server: string,
    { appId, audioBufferingMs = 20 }: FlowClientOptions,
  ) {
    super();
    this.appId = appId;
    this.audioBufferingMs = audioBufferingMs;
  }

  // active websocket
  private ws: WebSocket | null = null;

  private serverSeqNo = 0;
  private clientSeqNo = 0;

  private isConnected() {
    return this.socketState() === 'open';
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
  socketState() {
    if (!this.ws) return;
    return (['connecting', 'open', 'closing', 'closed'] as const)[
      this.ws?.readyState
    ];
  }

  async connect(jwt: string, timeoutMs = 10_000) {
    if (this.isConnected()) {
      throw new Error('Flow client is already connected');
    }

    const waitForConnect = new Promise((resolve, reject) => {
      const wsUrl = new URL('/v1/flow', this.server);
      wsUrl.searchParams.append('jwt', jwt);
      wsUrl.searchParams.append('sm-app', this.appId);

      this.ws = new WebSocket(wsUrl.toString());

      this.dispatchTypedEvent(
        'socketInitialized',
        new Event('socketInitialized'),
      );

      // Setup socket event listeners right away
      this.setupSocketEventListeners();

      this.addEventListener('socketOpen', resolve, { once: true });

      this.addEventListener(
        'socketError',
        (e) => {
          reject(new Error('Error opening websocket', { cause: e }));
        },
        { once: true },
      );
    });

    await Promise.race([
      waitForConnect,
      rejectAfter(timeoutMs, 'websocket connect'),
    ]);
  }

  private setupSocketEventListeners() {
    if (!this.ws) throw new Error('socket not initialized!');

    this.ws.addEventListener('open', () => {
      this.dispatchTypedEvent('socketOpen', new Event('socketOpen'));
    });
    this.ws.addEventListener('close', () =>
      this.dispatchTypedEvent('socketClose', new Event('socketClose')),
    );
    this.ws.addEventListener('error', (e) =>
      this.dispatchTypedEvent('socketError', new Event('socketError', e)),
    );

    this.ws.addEventListener('message', ({ data }) => {
      // handle binary audio
      if (data instanceof Blob) {
        // send ack as soon as we receive audio
        this.sendWebsocketMessage({
          message: 'AudioReceived',
          seq_no: ++this.serverSeqNo,
          buffering: this.audioBufferingMs / 1000,
        });

        this.agentAudioQueue.push(data);

        // Flush audio queue and dispatch events after buffer delay
        setTimeout(() => {
          while (this.agentAudioQueue.length) {
            const data = this.agentAudioQueue.shift();
            data?.arrayBuffer().then((arrayBuffer) => {
              this.dispatchTypedEvent(
                'agentAudio',
                new AgentAudioEvent(new Uint8Array(arrayBuffer)),
              );
            });
          }
        }, this.audioBufferingMs);

        return;
      }

      if (typeof data !== 'string') {
        throw new Error(`Unexpected message type: ${data}`);
      }

      // We're intentionally not validating the message shape. It is design by contract
      let parsedData: FlowClientIncomingMessage;
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        throw new Error('Failed to parse message as JSON');
      }

      this.dispatchTypedEvent(
        'message',
        new MessageEvent('message', { data: parsedData }),
      );
    });
  }

  private sendWebsocketMessage(message: FlowClientOutgoingMessage) {
    if (this.isConnected()) {
      this.ws?.send(JSON.stringify(message));
    }
  }

  public sendWebsocketAudio(pcm16Data: Int16Array) {
    if (this.isConnected()) {
      this.ws?.send(pcm16Data);
    }
  }

  async startConversation(config: { persona: { id: string } }) {
    if (!this.isConnected()) {
      throw new Error(
        'Must call and await `connect` before starting conversation',
      );
    }

    const waitForConversationStarted = new Promise<void>((resolve) => {
      const client = this;
      this.addEventListener('message', function onStart({ data }) {
        if (data.message === 'ConversationStarted') {
          resolve();
          client.removeEventListener('message', onStart);
        }
      });

      const startMessage: StartConversationMessage = {
        message: 'StartConversation',
        conversation_config: {
          template_id: config.persona.id,
          template_variables: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
        audio_format: {
          type: 'raw',
          encoding: 'pcm_s16le',
          sample_rate: 16000,
        },
      };
      this.sendWebsocketMessage(startMessage);
    });

    await Promise.race([
      waitForConversationStarted,
      rejectAfter(10_000, 'conversation start'),
    ]);
  }

  endConversation() {
    this.sendWebsocketMessage({
      message: 'AudioEnded',
      last_seq_no: this.clientSeqNo,
    });
    this.disconnectSocket();
  }

  private disconnectSocket() {
    this.dispatchTypedEvent('socketClosing', new Event('socketClosing'));
    this.ws?.close();
  }
}

function rejectAfter(timeoutMs: number, key: string) {
  return new Promise((_, reject) => {
    setTimeout(
      () =>
        reject(new Error(`Timed out after ${timeoutMs}s waiting for ${key}`)),
      timeoutMs,
    );
  });
}
