import EventEmitter from 'events';
import { ConnectionConfig, ConnectionConfigFull } from '../config/connection';
import { RealtimeSocketHandler, defaultLanguage } from './handlers';
import {
  RealtimeMessageMessageEnum as MessagesEnum,
  ModelError,
  AddTranscript,
  AddPartialTranscript,
  RecognitionStarted,
  AddTranslation,
  AddPartialTranslation,
  SessionConfig,
  ISocketWrapper,
} from '../types';
import * as nodeWrapper from '../realtime/node';
import * as webWrapper from '../realtime/browser';
import * as chromeWrapper from '../realtime/extension';

import { EventMap } from '../types/event-map';

/**
 * A class that represents a single realtime session. It's responsible for handling the connection and the messages.
 *
 * @param config - An apiKey string or an object of type ConnectionConfig. If only the string is provided, then the default ConnectionConfig will be used with this apiKey.
 *
 */
export class RealtimeSession {
  connectionConfig: ConnectionConfigFull;
  private emitter: EventEmitter = new EventEmitter();
  rtSocketHandler: RealtimeSocketHandler;

  constructor(config: string | ConnectionConfig) {
    this.connectionConfig = new ConnectionConfigFull(config);

    let socketImplementation: ISocketWrapper | null = null;
    if (typeof window !== 'undefined') {
      socketImplementation = new webWrapper.WebSocketWrapper();
    } else if (typeof chrome !== 'undefined') {
      socketImplementation = new chromeWrapper.WebSocketWrapper();
    } else if (typeof process !== 'undefined') {
      socketImplementation = new nodeWrapper.NodeWebSocketWrapper();
    } else {
      throw new Error('Unsupported environment');
    }

    this.rtSocketHandler = new RealtimeSocketHandler(
      this.bindHandlers(),
      socketImplementation,
    );
  }

  private bindHandlers() {
    return {
      onRecognitionStart: (data: RecognitionStarted) => {
        this.emitter.emit(MessagesEnum.RecognitionStarted, data);
      },
      onRecognitionEnd: () => {
        this.emitter.emit(MessagesEnum.EndOfTranscript, this);
      },
      onFullReceived: (data: AddTranscript) => {
        this.emitter.emit(MessagesEnum.AddTranscript, data);
      },
      onPartialReceived: (data: AddPartialTranscript) => {
        this.emitter.emit(MessagesEnum.AddPartialTranscript, data);
      },
      onFullTranslationReceived: (data: AddTranslation) => {
        this.emitter.emit(MessagesEnum.AddTranslation, data);
      },
      onPartialTranslationReceived: (data: AddPartialTranslation) => {
        this.emitter.emit(MessagesEnum.AddPartialTranslation, data);
      },
      onError: (data: ModelError) => {
        this.emitter.emit(MessagesEnum.Error, data);
      },
    };
  }

  /**
   * Adds a listener for the specified event.
   *
   * @param event - The event to listen for. Should be one of the RealtimeMessageMessageEnum values.
   * @param listener - The callback function that will be called when the event is emitted.
   */
  addListener<MessagesEnum extends keyof EventMap>(
    event: MessagesEnum,
    listener: EventMap[MessagesEnum],
  ) {
    this.emitter.addListener(event, listener);
  }

  /**
   * Removes a listener for the specified event.
   *
   * @param event - The event to remove the listener from. Should be one of the RealtimeMessageMessageEnum values.
   * @param listener - The callback function that will be removed.
   */
  removeListener<MessagesEnum extends keyof EventMap>(
    event: MessagesEnum,
    listener: EventMap[MessagesEnum],
  ) {
    this.emitter.removeListener(event, listener);
  }

  /**
   * Starts the realtime transcription session.
   *
   * @param transcriptionConfig - The config for the transcription. If not provided, the default options from the config will be used.
   * @param audioFormat - The audio format of the audio data that will be sent to the server. If not provided, the default audio format from the config will be used.
   * @returns Promise that resolves when the session is started.
   */
  async start(config?: SessionConfig) {
    //todo validate options

    const runtimeKey =
      typeof this.connectionConfig.apiKey === 'string'
        ? this.connectionConfig.apiKey
        : await this.connectionConfig.apiKey();

    let error: Error | null = null;

    await this.rtSocketHandler
      .connect(
        `${this.connectionConfig.realtimeUrl}/${
          config?.transcription_config?.language || defaultLanguage
        }`,
        runtimeKey,
        this.connectionConfig.appId,
      )
      .catch((err) => {
        error = new Error(
          `Unable to connect to RT runtime: ${JSON.stringify(err)}`,
        );
      });

    if (error) {
      return Promise.reject(error);
    }

    return this.rtSocketHandler.startRecognition(config);
  }

  /**
   * Stops the realtime transcription session.
   *
   * @returns Promise that resolves when the session is stopped.
   */
  async stop() {
    return this.rtSocketHandler.stopRecognition().catch((err) => {
      return new Error(
        `Unable to stop recognition cleanly ${JSON.stringify(err)}`,
      );
    });
  }
  /**
   * Sends audio data to the server.
   *
   * @param data - The audio data to send to the server. Should be a Float32Array. PCM audio.
   */
  sendAudio(data: Float32Array | Buffer | Blob) {
    this.rtSocketHandler.sendAudioBuffer(data);
  }

  /**
   * Checks if the session is connected to the server.
   *
   * @returns True if the session is connected to the server, false otherwise.
   */
  isConnected() {
    return this.rtSocketHandler.isConnected();
  }
}
