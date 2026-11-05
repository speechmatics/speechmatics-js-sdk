import { TypedEventTarget } from 'typescript-event-target';
import type {
  StartRecognition,
  RecognitionStarted,
  RealtimeClientMessage,
  RealtimeServerMessage,
  SpeakersResult,
  MidSessionTranscriptionConfig,
  AddAudio,
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

  // Multichannel state. When channel diarization is enabled, audio is sent per channel via `AddChannelAudio`,
  // and each channel is closed with its own `EndOfChannel` message rather than a single `EndOfStream`.
  // https://docs.speechmatics.com/speech-to-text/features/diarization#channel-diarization
  private multichannel = false;
  // Channel IDs declared in the config / confirmed by the server in `RecognitionStarted`
  private channelIds: string[] = [];
  // Number of `AddChannelAudio` messages sent per channel. Sequence numbers start at 1,
  // so this count equals the `seq_no` of the last chunk sent on that channel.
  private channelSeqNos = new Map<string, number>();
  private endedChannels = new Set<string>();
  private endOfTranscriptReceived = false;

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
        } else if (
          data.message === 'RecognitionStarted' &&
          data.channel_ids?.length
        ) {
          this.channelIds = data.channel_ids;
        } else if (data.message === 'EndOfTranscript') {
          this.endOfTranscriptReceived = true;
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

  /**
   * Sends a chunk of audio for a single channel, for use with multichannel sessions
   * (`transcription_config.diarization` set to `"channel"` or `"channel_and_speaker"`).
   *
   * @param channel The channel ID. Must be one of the labels in `transcription_config.channel_diarization_labels`.
   * @param data Raw audio bytes (in the encoding given by `audio_format`), or a string that is already base64 encoded.
   */
  sendChannelAudio(
    channel: string,
    data: string | ArrayBuffer | ArrayBufferView,
  ) {
    if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
      throw new SpeechmaticsRealtimeError('Socket not ready to receive audio');
    }
    if (this.endedChannels.has(channel)) {
      throw new SpeechmaticsRealtimeError(
        `Cannot send audio on channel "${channel}" after it has been ended`,
      );
    }

    this.sendMessage({
      message: 'AddChannelAudio',
      channel,
      data: typeof data === 'string' ? data : toBase64(data),
    });
    this.channelSeqNos.set(channel, (this.channelSeqNos.get(channel) ?? 0) + 1);
  }

  /**
   * Signals that no more audio will be sent on the given channel, by sending an `"EndOfChannel"` message.
   * The server sends `"EndOfTranscript"` once every channel has ended.
   *
   * You don't usually need to call this directly: `stopRecognition()` ends any channels that are still open.
   * It's useful when one channel finishes before the others (e.g. one participant hangs up).
   */
  endChannel(channel: string) {
    if (this.endedChannels.has(channel)) {
      return;
    }
    this.sendMessage({
      message: 'EndOfChannel',
      channel,
      last_seq_no: this.channelSeqNos.get(channel) ?? 0,
    });
    this.endedChannels.add(channel);
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
    if (config.transcription_config?.operating_point) {
      console.warn(
        '[Speechmatics] transcription_config.operating_point is deprecated. Use transcription_config.model instead.',
      );
    }

    this.resetSessionState(config);
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

  private resetSessionState(config: RealtimeTranscriptionConfig) {
    const diarization = config.transcription_config?.diarization;
    this.multichannel =
      diarization === 'channel' || diarization === 'channel_and_speaker';
    this.channelIds =
      config.transcription_config?.channel_diarization_labels ?? [];
    this.channelSeqNos.clear();
    this.endedChannels.clear();
    this.lastAudioAddedSeqNo = 0;
    this.endOfTranscriptReceived = false;
  }

  /**
   * Signals the end of audio, resolving if acknowledged by an `"EndOfTranscript"` from server, rejecting if not received.
   *
   * For single-channel sessions this sends `"EndOfStream"`.
   * For multichannel sessions it sends `"EndOfChannel"` for every channel that hasn't already been ended.
   */
  async stopRecognition({ noTimeout }: { noTimeout?: true } = {}) {
    const waitForEndOfTranscript = new Promise<void>((resolve) => {
      // In multichannel sessions, all channels may have been ended individually already,
      // in which case the server may have sent EndOfTranscript before we got here.
      if (this.endOfTranscriptReceived) {
        this.socket?.close();
        resolve();
        return;
      }

      this.addEventListener('receiveMessage', ({ data }) => {
        if (data.message === 'EndOfTranscript') {
          this.socket?.close();
          resolve();
        }
      });

      if (this.multichannel) {
        const channels = new Set([
          ...this.channelIds,
          ...this.channelSeqNos.keys(),
        ]);
        for (const channel of channels) {
          this.endChannel(channel);
        }
      } else {
        this.sendMessage({
          message: 'EndOfStream',
          last_seq_no: this.lastAudioAddedSeqNo,
        });
      }
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

function toBase64(data: ArrayBuffer | ArrayBufferView): string {
  const bytes =
    data instanceof ArrayBuffer
      ? new Uint8Array(data)
      : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

  // Build the binary string in chunks to avoid exceeding the max call stack size for large buffers
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
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
