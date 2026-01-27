import { TypedEventTarget } from 'typescript-event-target';
import type {
  StartRecognition,
  RecognitionStarted,
  RealtimeClientMessage,
  RealtimeServerMessage,
  TranscriptionConfig,
  SpeakersResult,
  MidSessionTranscriptionConfig,
} from '../models';

export class SocketStateChangeEvent extends Event {
  constructor(public readonly socketState: RealtimeClient['socketState']) {
    super('socketStateChange');
  }
}

export class ReceiveMessageEvent extends Event {
  constructor(public readonly data: RealtimeServerMessage) {
    super('receiveMessage');
  }
}

export class SendMessageEvent extends Event {
  constructor(public readonly data: RealtimeClientMessage) {
    super('sendMessage');
  }
}

export interface RealtimeClientEventMap {
  sendMessage: SendMessageEvent;
  receiveMessage: ReceiveMessageEvent;
  socketStateChange: SocketStateChangeEvent;
}

export type AddAudio = Parameters<WebSocket['send']>[0];

export interface RealtimeClientOptions {
  /**
   * URL of the Speechmatics Realtime API, see options here: https://docs.speechmatics.com/introduction/authentication#supported-endpoints
    defaults to `wss://eu2.rt.speechmatics.com/v2`
  */
  url?: string;
  /**
   * String identifying your app to the Speechmatics API. Can be any unique ID
   */
  appId?: string;
  /**
   * Optionally enable legacy mode for the Realtime API. This opts out of incremental rescoring.
   * Only set this if you're sure you need it.
   */
  enableLegacy?: boolean;
  /**
   *  Optionally specify the timeout (in milliseconds) to wait before throwing an error on starting and stopping
   *  For example, a value of 10_000 will throw an error if it takes more than 10 seconds to receive acknowledgement from the server after calling `start()` or `stopRecognition()`
   *  Default value is 10_000 (10 seconds)
   */
  connectionTimeout?: number;
}
export type RealtimeTranscriptionConfig = Omit<
  StartRecognition,
  'message' | 'audio_format'
> &
  Partial<Pick<StartRecognition, 'audio_format'>>;

export class RealtimeClient extends TypedEventTarget<RealtimeClientEventMap> {
  readonly url: string;
  private readonly appId?: string;
  private readonly enableLegacy: boolean;
  timeout: number;

  constructor(config: RealtimeClientOptions = {}) {
    super();
    this.url = config.url ?? 'wss://eu2.rt.speechmatics.com/v2';
    this.appId = config.appId;
    this.enableLegacy = config.enableLegacy ?? false;
    this.timeout = config.connectionTimeout ?? 10_000;
  }

  private socket?: WebSocket;

  get socketState() {
    if (!this.socket) return undefined;
    return {
      [WebSocket.CONNECTING]: 'connecting' as const,
      [WebSocket.OPEN]: 'open' as const,
      [WebSocket.CLOSING]: 'closing' as const,
      [WebSocket.CLOSED]: 'closed' as const,
    }[this.socket.readyState];
  }

  // Track the last AudioAdded sequence number, used when stopping transcription to avoid missing audio
  // https://docs.speechmatics.com/rt-api-ref#audioadded
  private lastAudioAddedSeqNo = 0;

  private async connect(jwt: string) {
    return new Promise<void>((resolve, reject) => {
      const url = new URL(this.url);
      url.searchParams.append('jwt', jwt);
      if (this.appId) {
        url.searchParams.append('sm-app', this.appId);
      }

      if (this.enableLegacy) {
        url.searchParams.append('sm-enable-legacy-rt', 'true');
      }

      this.socket = new WebSocket(url.toString());
      this.dispatchTypedEvent(
        'socketStateChange',
        new SocketStateChangeEvent(this.socketState),
      );

      this.socket.addEventListener(
        'open',
        () => {
          resolve();
        },
        { once: true },
      );

      this.socket.addEventListener('error', (error) => {
        this.dispatchTypedEvent(
          'socketStateChange',
          new SocketStateChangeEvent(this.socketState),
        );
        // In case the above hasn't resolved, we can reject here rather than waiting
        // If the above has resolved, this will be ignored
        reject(error);
      });

      this.socket.addEventListener('close', () => {
        this.dispatchTypedEvent(
          'socketStateChange',
          new SocketStateChangeEvent(this.socketState),
        );
      });

      this.socket.addEventListener('message', (socketMessage) => {
        // Turn message into one of the union type of events
        // Pass it to this event target
        const data = JSON.parse(socketMessage.data) as unknown;
        if (!dataIsRealtimeTranscriptionMessage(data)) {
          console.warn(
            'message does not look like a valid message: ',
            JSON.stringify(data),
          );
          return;
        }

        if (data.message === 'AudioAdded') {
          this.lastAudioAddedSeqNo = data.seq_no;
        }

        this.dispatchTypedEvent(
          'receiveMessage',
          new ReceiveMessageEvent(data),
        );
      });
    });
  }

  private sendMessage(message: RealtimeClientMessage) {
    if (!this.socket) {
      throw new SpeechmaticsRealtimeError('Client socket not initialized');
    }
    this.socket.send(JSON.stringify(message));
    this.dispatchTypedEvent('sendMessage', new SendMessageEvent(message));
  }

  sendAudio(data: AddAudio) {
    if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
      throw new SpeechmaticsRealtimeError('Socket not ready to receive audio');
    }
    this.socket.send(data);
  }

  async getSpeakers(
    options: { final?: boolean; timeout?: number } = {},
  ): Promise<SpeakersResult> {
    this.sendMessage({
      message: 'GetSpeakers',
      final: options.final,
    });

    const waitForSpeakers = new Promise<SpeakersResult>((resolve, reject) => {
      this.addEventListener('receiveMessage', ({ data }) => {
        if (data.message === 'SpeakersResult') {
          resolve(data);
        }
        // If client receives an error message before starting, reject immediately
        else if (data.message === 'Error') {
          reject(new Error(data.type));
        }
      });
      this.addEventListener('socketStateChange', (state) => {
        state.socketState === 'closed' && reject(new Error('Socket closed'));
      });
    });

    if (options.timeout) {
      return Promise.race([
        waitForSpeakers,
        rejectAfter<SpeakersResult>(options.timeout, 'SpeakersResult'),
      ]);
    }
    return waitForSpeakers;
  }

  async start(
    jwt: string,
    config: RealtimeTranscriptionConfig,
  ): Promise<RecognitionStarted> {
    await this.connect(jwt);

    const waitForRecognitionStarted = new Promise<RecognitionStarted>(
      (resolve, reject) => {
        this.addEventListener('receiveMessage', ({ data }) => {
          if (data.message === 'RecognitionStarted') {
            resolve(data);
          }
          // If client receives an error message before starting, reject immediately
          else if (data.message === 'Error') {
            reject(new Error(data.type));
          }
        });

        const startRecognitionMessage: StartRecognition = {
          audio_format: defaultAudioFormat,
          ...config,
          message: 'StartRecognition' as const,
        };

        this.sendMessage(startRecognitionMessage);
      },
    );

    return Promise.race([
      waitForRecognitionStarted,
      rejectAfter<RecognitionStarted>(this.timeout, 'RecognitionStarted'),
    ]);
  }

  /** Sends an `"EndOfStream"` message, resolving if acknowledged by an `"EndOfTranscript"` from server, rejecting if not received */
  async stopRecognition({ noTimeout }: { noTimeout?: true } = {}) {
    const waitForEndOfTranscript = new Promise<void>((resolve) => {
      this.addEventListener('receiveMessage', ({ data }) => {
        if (data.message === 'EndOfTranscript') {
          this.socket?.close();
          resolve();
        }
      });

      this.sendMessage({
        message: 'EndOfStream',
        last_seq_no: this.lastAudioAddedSeqNo,
      });
    });

    if (noTimeout) {
      return;
    }

    return Promise.race([
      waitForEndOfTranscript,
      rejectAfter(this.timeout, 'EndOfTranscript'),
    ]);
  }

  setRecognitionConfig(config: MidSessionTranscriptionConfig) {
    this.sendMessage({
      message: 'SetRecognitionConfig' as const,
      transcription_config: config,
    });
  }

  forceEndOfUtterance(channel?: string) {
    this.sendMessage({
      message: 'ForceEndOfUtterance' as const,
      channel,
    });
  }
}

function dataIsRealtimeTranscriptionMessage(
  data: unknown,
): data is RealtimeServerMessage {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  if (!('message' in data)) {
    return false;
  }
  if (typeof data.message !== 'string') {
    return false;
  }
  return true;
}

const defaultAudioFormat = {
  type: 'file',
} as const;

export class SpeechmaticsRealtimeError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'SpeechmaticsRealtimeError';
  }
}

function rejectAfter<T = unknown>(timeoutMs: number, key: string): Promise<T> {
  return new Promise<T>((_, reject) => {
    setTimeout(
      () =>
        reject(
          new SpeechmaticsRealtimeError(
            `Timed out after ${timeoutMs}ms waiting for ${key}`,
          ),
        ),
      timeoutMs,
    );
  });
}
