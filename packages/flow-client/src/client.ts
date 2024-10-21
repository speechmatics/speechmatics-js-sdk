import { TypedEventTarget } from 'typescript-event-target';
import {
  AgentAudioEvent,
  FlowIncomingMessageEvent,
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

  // Buffer for audio received from server
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

  get socketState() {
    if (!this.ws) return undefined;
    return {
      [WebSocket.CONNECTING]: 'connecting' as const,
      [WebSocket.OPEN]: 'open' as const,
      [WebSocket.CLOSING]: 'closing' as const,
      [WebSocket.CLOSED]: 'closed' as const,
    }[this.ws.readyState];
  }

  private async connect(jwt: string, timeoutMs = 10_000) {
    const socketState = this.socketState;
    if (socketState && socketState !== 'closed') {
      throw new SpeechmaticsFlowError(
        `Cannot start connection while socket is ${socketState}`,
      );
    }

    const waitForConnect = new Promise((resolve, reject) => {
      const wsUrl = new URL('/v1/flow', this.server);
      wsUrl.searchParams.append('jwt', jwt);
      wsUrl.searchParams.append('sm-app', this.appId);

      this.ws = new WebSocket(wsUrl.toString());
      this.ws.binaryType = 'blob';

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
          reject(
            new SpeechmaticsFlowError('Error opening websocket', { cause: e }),
          );
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
    if (!this.ws) throw new SpeechmaticsFlowError('socket not initialized!');

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
        this.handleWebocketAudio(data);
      } else if (typeof data === 'string') {
        this.handleWebsocketMessage(data);
      } else {
        throw new SpeechmaticsFlowError(`Unexpected message type: ${data}`);
      }
    });
  }

  private handleWebocketAudio(data: Blob) {
    // send ack as soon as we receive audio
    this.sendWebsocketMessage({
      message: 'AudioReceived',
      seq_no: ++this.serverSeqNo,
      buffering: this.audioBufferingMs / 1000,
    });

    this.agentAudioQueue.push(data);

    // Flush audio queue and dispatch play events after buffer delay
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
  }

  private handleWebsocketMessage(message: string) {
    // We're intentionally not validating the message shape. It is design by contract
    let data: FlowClientIncomingMessage;
    try {
      data = JSON.parse(message);
    } catch (e) {
      throw new SpeechmaticsFlowError('Failed to parse message as JSON');
    }

    if (data.message === 'AudioAdded') {
      this.clientSeqNo = data.seq_no;
    }

    this.dispatchTypedEvent('message', new FlowIncomingMessageEvent(data));
  }

  private sendWebsocketMessage(message: FlowClientOutgoingMessage) {
    if (this.socketState === 'open') {
      this.ws?.send(JSON.stringify(message));
    }
  }

  public sendAudio(pcm16Data: Int16Array) {
    if (this.socketState === 'open') {
      this.ws?.send(pcm16Data);
    }
  }

  async startConversation(
    jwt: string,
    config: StartConversationMessage['conversation_config'],
  ) {
    await this.connect(jwt);

    const waitForConversationStarted = new Promise<void>((resolve, reject) => {
      const client = this;
      this.addEventListener('message', function onStart({ data }) {
        if (data.message === 'ConversationStarted') {
          resolve();
          client.removeEventListener('message', onStart);
        } else if (data.message === 'Error') {
          reject(
            new SpeechmaticsFlowError('Error waiting for conversation start', {
              cause: data,
            }),
          );
        }
      });

      const conversation_config = {
        ...config,
        template_variables: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...config.template_variables,
        },
      };

      const startMessage: StartConversationMessage = {
        message: 'StartConversation',
        conversation_config,
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
        reject(
          new SpeechmaticsFlowError(
            `Timed out after ${timeoutMs}s waiting for ${key}`,
          ),
        ),
      timeoutMs,
    );
  });
}

export class SpeechmaticsFlowError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'SpeechmaticsFlowError';
  }
}
