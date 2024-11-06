import { TypedEventTarget } from 'typescript-event-target';
import type { StartRecognition } from '../models/start-recognition';
import type { SetRecognitionConfig } from '../models/set-recognition-config';
import type { EndOfStream } from '../models/end-of-stream';
import type { RecognitionStarted } from '../models/recognition-started';
import type { AudioAdded } from '../models/audio-added';
import type { AddPartialTranscript } from '../models/add-partial-transcript';
import type { AddTranscript } from '../models/add-transcript';
import type { AddPartialTranslation } from '../models/add-partial-translation';
import type { AddTranslation } from '../models/add-translation';
import type { EndOfTranscript } from '../models/end-of-transcript';
import type { AudioEventStarted } from '../models/audio-event-started';
import type { AudioEventEnded } from '../models/audio-event-ended';
import type { Info } from '../models/info';
import type { Warning } from '../models/warning';
import type { ModelError } from '../models/model-error';

// Messages to be sent to server
export type RealtimeClientMessage =
  | StartRecognition
  | { message: 'AddAudio' }
  | SetRecognitionConfig
  | EndOfStream;

// Messages received from the server
export type RealtimeServerMessage =
  | SetRecognitionConfig
  | RecognitionStarted
  | AudioAdded
  | AddPartialTranscript
  | AddTranscript
  | AddPartialTranslation
  | AddTranslation
  | EndOfTranscript
  | AudioEventStarted
  | AudioEventEnded
  | Info
  | Warning
  | ModelError;

export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'starting'
  | 'running'
  | 'stopping';

export interface RealtimeClientEventMap {
  sendMessage: MessageEvent<RealtimeClientMessage>;
  receiveMessage: MessageEvent<RealtimeServerMessage>;
  socketStateChange: Event;
}

export class RealtimeClient extends TypedEventTarget<RealtimeClientEventMap> {
  constructor(config: { url?: string; appId?: string } = {}) {
    super();
    this.url = config.url ?? 'wss://eu2.rt.speechmatics.com/v2';
    this.appId = config.appId;
  }

  private readonly url: string;
  private readonly appId?: string;

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

      this.socket = new WebSocket(url.toString());
      this.dispatchTypedEvent(
        'socketStateChange',
        new Event('socketStateChange'),
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
          new Event('socketStateChange'),
        );
        // In case the above hasn't resolved, we can reject here rather than waiting
        // If the above has resolved, this will be ignored
        reject(error);
      });

      this.socket.addEventListener('close', () => {
        this.dispatchTypedEvent(
          'socketStateChange',
          new Event('socketStateChange'),
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
          new MessageEvent('receiveMessage', { data }),
        );
      });
    });
  }

  sendMessage(message: RealtimeClientMessage) {
    if (!this.socket) {
      throw new SpeechmaticsRealtimeError('Client socket not initialized');
    }
    this.socket.send(JSON.stringify(message));
    this.dispatchTypedEvent(
      'sendMessage',
      new MessageEvent('sendMessage', { data: message }),
    );
  }

  sendAudio(data: Blob | ArrayBufferLike | string) {
    if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
      throw new SpeechmaticsRealtimeError('Socket not ready to receive audio');
    }
    this.socket.send(data);
  }

  async start(
    jwt: string,
    config: Omit<StartRecognition, 'message' | 'audio_format'> &
      Partial<Pick<StartRecognition, 'audio_format'>>,
  ): Promise<RecognitionStarted> {
    await this.connect(jwt);

    const waitForConversationStarted = new Promise<RecognitionStarted>(
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

        const startRecognitionMessage = {
          ...config,
          audio_format: defaultAudioFormat,
          message: 'StartRecognition' as const,
        };

        this.sendMessage(startRecognitionMessage);
      },
    );

    return Promise.race([
      waitForConversationStarted,
      rejectAfter<RecognitionStarted>(
        RT_CLIENT_RESPONSE_TIMEOUT_MS,
        'RecognitionStarted',
      ),
    ]);
  }

  /** Sends an `"EndOfStream"` message, resolving if acknowledged by an `"EndOfTranscript"` from server, rejecting if not received */
  async stopRecognition() {
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

    return Promise.race([
      waitForEndOfTranscript,
      rejectAfter(RT_CLIENT_RESPONSE_TIMEOUT_MS, 'EndOfTranscript'),
    ]);
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

const RT_CLIENT_RESPONSE_TIMEOUT_MS = 10_000;

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
            `Timed out after ${timeoutMs}s waiting for ${key}`,
          ),
        ),
      timeoutMs,
    );
  });
}
