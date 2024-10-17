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

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async connect(jwt: string, timeoutMs = 10_000) {
    if (this.isConnected()) {
      throw new Error('Flow client is already connected');
    }

    const waitForConnect = new Promise<void>((resolve, reject) => {
      const wsUrl = new URL('/v1/flow', this.server);
      wsUrl.searchParams.append('jwt', jwt);
      wsUrl.searchParams.append('sm-app', this.appId);

      this.ws = new WebSocket(wsUrl.toString());

      // Setup socket event listeners right away
      this.setupSocketEventListeners();

      this.ws.addEventListener(
        'open',
        () => {
          // Setup all other event listeners after opening
          this.setupEventListeners();
          resolve();
        },
        { once: true },
      );

      this.ws.addEventListener(
        'error',
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
    this.ws?.addEventListener('open', () => {
      this.dispatchTypedEvent('socketOpen', new Event('socketOpen'));
    });
    this.ws?.addEventListener('close', () =>
      this.dispatchTypedEvent('socketClose', new Event('socketClose')),
    );
  }

  private setupEventListeners() {
    this.ws?.addEventListener('message', ({ data }) => {
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
    this.ws?.send(JSON.stringify(message));
  }

  public sendWebsocketAudio(pcm16Data: Int16Array) {
    this.ws?.send(pcm16Data);
  }

  async startConversation(config: { persona: { id: string } }) {
    if (!this.isConnected()) {
      throw new Error(
        'Must call and await `connect` before starting conversation',
      );
    }

    const waitForConversationStarted = new Promise<void>((resolve) => {
      this.addEventListener('message', ({ data }) => {
        if (data.message === 'ConversationStarted') {
          resolve();
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

  async endConversation() {
    this.sendWebsocketMessage({
      message: 'AudioEnded',
      last_seq_no: this.clientSeqNo,
    });
    await this.disconnectSocket();
  }

  private async disconnectSocket() {
    const waitForDisconnect = new Promise((resolve, reject) => {
      if (!this.ws) return reject(new Error('no socket'));
      this.ws.onclose = resolve;
    });

    return Promise.race([waitForDisconnect, rejectAfter(10_000, 'disconnect')]);
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
