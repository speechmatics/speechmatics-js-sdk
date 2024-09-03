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
import type { TranscriptionConfig } from '../models/transcription-config';
import type { TranslationConfig } from '../models/translation-config';

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
  changeConnectionState: Event;
}

export class RealtimeClient extends TypedEventTarget<RealtimeClientEventMap> {
  constructor(private config: { url: string; appId?: string }) {
    super();
  }

  private socket?: WebSocket;

  private _connectionState: ConnectionState = 'idle';

  get connectionState() {
    return this._connectionState;
  }

  private set connectionState(value: ConnectionState) {
    this._connectionState = value;
    this.dispatchTypedEvent(
      'changeConnectionState',
      new Event('changeConnectionState'),
    );
  }

  // Track the last AudioAdded sequence number, used when stopping transcription to avoid missing audio
  // https://docs.speechmatics.com/rt-api-ref#audioadded
  private lastAudioAddedSeqNo = 0;

  private async connect(jwt: string) {
    return new Promise<void>((resolve, reject) => {
      this.connectionState = 'connecting';

      const url = new URL(this.config.url);
      url.searchParams.append('jwt', jwt);
      if (this.config.appId) {
        url.searchParams.append('sm-app', this.config.appId);
      }

      this.socket = new WebSocket(url.toString());

      this.socket.addEventListener(
        'open',
        () => {
          resolve();
        },
        { once: true },
      );

      this.socket.addEventListener('error', (error) => {
        console.error(error);
        // In case the above hasn't resolved, we can reject here rather than waiting
        // If the above has resolved, this will be ignored
        reject(error);
      });

      this.socket.addEventListener('close', () => {
        this.connectionState = 'idle';
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

        if (data.message === 'RecognitionStarted') {
          this.connectionState = 'running';
        }
        if (data.message === 'Error') {
          console.error(data);
        }
        if (data.message === 'RecognitionStarted') {
          this.connectionState = 'running';
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
      console.warn('Client socket not initialized');
      return;
    }
    this.socket.send(JSON.stringify(message));
    this.dispatchTypedEvent(
      'sendMessage',
      new MessageEvent('sendMessage', { data: message }),
    );
  }

  sendAudio(data: Blob) {
    if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
      console.warn('Socket not ready to receive audio, will not pass data');
      return;
    }
    this.socket.send(data);
  }

  async startRecognition(config: {
    transcription_config: TranscriptionConfig;
    translation_config?: TranslationConfig;
  }) {
    const startRecognitionMessage = {
      ...config,
      audio_format: defaultAudioFormat,
      message: 'StartRecognition' as const,
    };

    this.connectionState = 'starting';

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () =>
          reject(
            new ServerTimeoutError(
              RT_CLIENT_RESPONSE_TIMEOUT_MS,
              'RecognitionStarted',
            ),
          ),
        RT_CLIENT_RESPONSE_TIMEOUT_MS,
      );

      this.addEventListener('changeConnectionState', () => {
        if (this.connectionState === 'running') {
          clearTimeout(timeout);
          resolve();
        }
      });

      // If client receives an error message before starting, reject immediately
      this.addEventListener('receiveMessage', ({ data }) => {
        if (data.message === 'Error') {
          clearTimeout(timeout);
          reject(new Error(data.type));
        }
      });

      this.sendMessage(startRecognitionMessage);
    });
  }

  async start(
    jwt: string,
    config: {
      transcription_config: TranscriptionConfig;
      translation_config?: TranslationConfig;
    },
  ) {
    await this.connect(jwt);
    await this.startRecognition(config);
  }

  /** Sends an `"EndOfStream"` message, resolving if acknowledged by an `"EndOfTranscript"` from server, rejecting if not received */
  async stopRecognition() {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new ServerTimeoutError(
            RT_CLIENT_RESPONSE_TIMEOUT_MS,
            'EndOfTranscript',
          ),
        );
      }, RT_CLIENT_RESPONSE_TIMEOUT_MS);

      this.addEventListener('receiveMessage', ({ data }) => {
        if (data.message === 'EndOfTranscript') {
          clearTimeout(timeout);
          this.socket?.close();
          resolve();
        }
      });

      this.connectionState = 'stopping';
      this.sendMessage({
        message: 'EndOfStream',
        last_seq_no: this.lastAudioAddedSeqNo,
      });
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

const RT_CLIENT_RESPONSE_TIMEOUT_MS = 10_000;

class ServerTimeoutError extends Error {
  name = 'ServerTimeoutError';

  constructor(timeoutMs: number, event: string) {
    const message = `Timed out after waiting ${Math.floor(
      timeoutMs / 1000,
    )} seconds for '${event}'`;
    super(message);
  }
}
