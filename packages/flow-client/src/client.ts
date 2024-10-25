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
  websocketBinaryType?: 'blob' | 'arraybuffer';
}

export class FlowClient extends TypedEventTarget<FlowClientEventMap> {
  public readonly appId: string;
  private readonly audioBufferingMs: number;

  // Buffer for audio received from server
  private agentAudioQueue:
    | { type: 'blob'; queue: Blob[] }
    | { type: 'arraybuffer'; queue: ArrayBuffer[] };

  constructor(
    public readonly server: string,
    {
      appId,
      audioBufferingMs = 10,
      websocketBinaryType = 'blob',
    }: FlowClientOptions,
  ) {
    super();
    this.appId = appId;
    this.audioBufferingMs = audioBufferingMs;

    this.agentAudioQueue = {
      type: websocketBinaryType,
      queue: [],
    };
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
      this.ws.binaryType = this.agentAudioQueue.type;

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
      if (data instanceof Blob || data instanceof ArrayBuffer) {
        this.handleWebsocketAudio(data);
      } else if (typeof data === 'string') {
        this.handleWebsocketMessage(data);
      } else {
        throw new SpeechmaticsFlowError(`Unexpected message type: ${data}`);
      }
    });
  }

  private handleWebsocketAudio(data: Blob | ArrayBuffer) {
    // send ack as soon as we receive audio
    this.sendWebsocketMessage({
      message: 'AudioReceived',
      seq_no: ++this.serverSeqNo,
      buffering: this.audioBufferingMs / 1000,
    });

    if (data instanceof Blob && this.agentAudioQueue.type === 'blob') {
      this.agentAudioQueue.queue.push(data);
    } else if (
      data instanceof ArrayBuffer &&
      this.agentAudioQueue.type === 'arraybuffer'
    ) {
      this.agentAudioQueue.queue.push(data);
    } else {
      throw new SpeechmaticsFlowError(
        `Could not process audio: expecting audio to be ${this.agentAudioQueue.type} but got ${data.constructor.name}`,
      );
    }

    // Flush audio queue and dispatch play events after buffer delay
    setTimeout(() => {
      this.flushAgentAudioQueue();
    }, this.audioBufferingMs);
  }

  private async flushAgentAudioQueue() {
    while (this.agentAudioQueue.queue.length) {
      const data = this.agentAudioQueue.queue.shift();
      if (!data) continue;

      const arrayBuffer =
        data instanceof Blob ? await data.arrayBuffer() : data;

      this.dispatchTypedEvent(
        'agentAudio',
        new AgentAudioEvent(new Int16Array(arrayBuffer)),
      );
    }
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

  public sendAudio(pcm16Data: ArrayBufferLike) {
    if (this.socketState === 'open') {
      this.ws?.send(pcm16Data);
    }
  }

  async startConversation(
    jwt: string,
    {
      config,
      audioFormat,
    }: {
      config: StartConversationMessage['conversation_config'];
      audioFormat?: StartConversationMessage['audio_format'];
    },
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
        audio_format: audioFormat ?? DEFAULT_AUDIO_FORMAT,
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
    this.flushAgentAudioQueue();
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

const DEFAULT_AUDIO_FORMAT = {
  type: 'raw',
  encoding: 'pcm_s16le',
  sample_rate: 16000,
} as const;
