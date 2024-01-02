/**
 * Speech service main api class
 */

import {
  ModelError,
  RealtimeMessage,
  RealtimeMessageMessageEnum as MessagesEnum,
  AudioAdded,
  Warning,
  AddTranscript,
  AddPartialTranscript,
  AddTranslation,
  AddPartialTranslation,
  Info,
  RecognitionStarted,
  RealtimeTranscriptionConfig,
  ISocketWrapper,
  SessionConfig,
} from '../types';
import { SpeechmaticsUnexpectedResponse } from '../utils/errors';

export const defaultLanguage = 'en';

const rtDefaultConfig: RealtimeTranscriptionConfig = {
  language: defaultLanguage,
};

const defaultAudioFormat = {
  type: 'file',
} as const;

export class RealtimeSocketHandler {
  private socketWrap: ISocketWrapper;

  private seqNoIn = 0;

  private startRecognitionResolve?: (data: RecognitionStarted) => void;
  private stopRecognitionResolve?: (value?: unknown) => void;
  private rejectPromise?: (error?: ModelError) => void; //used on both: start & stop

  private sub: Subscriber;

  constructor(sub: Subscriber, socketWrapImplementation: ISocketWrapper) {
    this.sub = sub;
    this.socketWrap = socketWrapImplementation;

    this.socketWrap.onMessage = this.onSocketMessage;
    this.socketWrap.onError = this.onSocketError;
    this.socketWrap.onDisconnect = this.onSocketDisconnect;
  }

  async connect(
    runtimeURL: string,
    runtimeKey?: string,
    appId?: string,
  ): Promise<void> {
    this.seqNoIn = 0;

    return this.socketWrap.connect(runtimeURL, runtimeKey, appId);
  }

  async disconnect(): Promise<void> {
    return this.socketWrap.disconnect();
  }

  isConnected(): boolean {
    return this.socketWrap.isOpen();
  }

  sendAudioBuffer(data: Blob | ArrayBufferLike): void {
    this.socketWrap.sendAudioBuffer(data);
  }

  async startRecognition(config?: SessionConfig): Promise<RecognitionStarted> {
    const startRecognitionMessage = {
      transcription_config: config?.transcription_config || rtDefaultConfig,
      audio_format: config?.audio_format || defaultAudioFormat,
      translation_config: config?.translation_config,
      message: 'StartRecognition',
    };

    this.socketWrap.sendMessage(JSON.stringify(startRecognitionMessage));

    this.seqNoIn = 0;

    return new Promise<RecognitionStarted>((resolve, reject): void => {
      this.startRecognitionResolve = resolve;
      this.rejectPromise = reject;
    });
  }

  async stopRecognition(): Promise<void> {
    if (!this.socketWrap.isOpen()) {
      return;
    }

    const stopMessage: string = JSON.stringify({
      message: MessagesEnum.EndOfStream,
      last_seq_no: this.seqNoIn,
    });

    this.socketWrap.sendMessage(stopMessage);

    return new Promise((resolve, reject): void => {
      this.stopRecognitionResolve = resolve;
      this.rejectPromise = reject;
    }).then(() => {
      return this.socketWrap.disconnect();
    });
  }

  private onSocketMessage = (data: RealtimeMessage): void => {
    switch (data.message) {
      case MessagesEnum.RecognitionStarted:
        this.sub?.onRecognitionStart?.(data as RecognitionStarted);
        this.startRecognitionResolve?.(data as RecognitionStarted);
        break;

      case MessagesEnum.AudioAdded:
        this.seqNoIn = (data as AudioAdded).seq_no || 0;
        break;

      case MessagesEnum.Warning:
        this.sub?.onWarning?.(data as Warning);
        break;

      case MessagesEnum.AddTranscript:
        this.seqNoIn++;
        this.sub?.onFullReceived?.(data as AddTranscript);
        break;

      case MessagesEnum.AddPartialTranscript:
        this.sub?.onPartialReceived?.(data as AddPartialTranscript);
        break;

      case MessagesEnum.AddTranslation:
        this.seqNoIn++;
        this.sub?.onFullTranslationReceived?.(data as AddTranslation);
        break;

      case MessagesEnum.AddPartialTranslation:
        this.sub?.onPartialTranslationReceived?.(data as AddPartialTranslation);
        break;

      case MessagesEnum.EndOfTranscript:
        this.sub?.onRecognitionEnd?.();
        this.stopRecognitionResolve?.();
        break;

      case MessagesEnum.Error:
        this.sub?.onError?.(data as ModelError);
        this.rejectPromise?.(data as ModelError);
        break;

      case MessagesEnum.Info:
        this.sub?.onInfo?.(data as Info);
        break;

      case MessagesEnum.StartRecognition:
      case MessagesEnum.AddAudio:
      case MessagesEnum.EndOfStream:
      case MessagesEnum.SetRecognitionConfig:
      case undefined:
        // TODO: is this correct?
        throw new SpeechmaticsUnexpectedResponse(
          `Unexpected RealtimeMessage during onSocketMessage: ${data.message}`,
        );
      default:
        data.message satisfies never;
        throw new SpeechmaticsUnexpectedResponse(
          `Unexpected RealtimeMessage during onSocketMessage: ${data.message}`,
        );
    }
  };

  private onSocketDisconnect = () => {
    this.sub.onDisconnect?.();
  };

  private onSocketError = (error: ModelError) => {
    this.sub.onError?.(error);
    this.rejectPromise?.(error);
  };
}

export type Subscriber = {
  onRecognitionStart?: (data: RecognitionStarted) => void;
  onRecognitionEnd?: () => void;
  onFullReceived?: (data: AddTranscript) => void;
  onPartialReceived?: (data: AddPartialTranscript) => void;
  onFullTranslationReceived?: (result: AddTranslation) => void;
  onPartialTranslationReceived?: (data: AddPartialTranslation) => void;
  onWarning?: (data: Warning) => void;
  onError?: (data: ModelError) => void;
  onInfo?: (data: Info) => void;
  onDisconnect?: () => void;
};
