import { ClientRequestArgs } from 'http';
import WebSocket, { ClientOptions } from 'ws';
import { ISocketWrapper } from '../types';
import { ModelError, RealtimeMessage } from '../types';
import {
  addQueryParamsToUrl,
  SM_APP_PARAM_NAME,
  SM_SDK_PARAM_NAME,
  getSmSDKVersion,
} from '../utils/request';
import { SpeechmaticsUnsupportedEnvironment } from '../utils/errors';

/**
 * Wraps the socket api to be more useful in async/await kind of scenarios
 */
export class NodeWebSocketWrapper implements ISocketWrapper {
  private socket?: WebSocket;
  private connectResolve?: () => void;
  private connectReject?: (event: Event) => void;
  private disconnectResolve?: () => void;

  onDisconnect?: () => void;
  onOpen?: () => void;
  onMessage?: (data: RealtimeMessage) => void;
  onError?: (event: ModelError) => void;

  constructor() {
    if (typeof process === 'undefined')
      throw new SpeechmaticsUnsupportedEnvironment(
        'process is undefined - are you running in node?',
      );
  }

  async connect(
    runtimeURL: string,
    authToken?: string,
    appId?: string,
  ): Promise<void> {
    const url = addQueryParamsToUrl(runtimeURL, {
      [SM_SDK_PARAM_NAME]: getSmSDKVersion(),
      [SM_APP_PARAM_NAME]: appId,
    });
    try {
      let options: ClientOptions | ClientRequestArgs | undefined;
      if (authToken)
        options = { headers: { Authorization: `Bearer ${authToken}` } };
      this.socket = new WebSocket(url, {
        perMessageDeflate: false,
        ...options,
      });
    } catch (error) {
      this.connectReject?.(error as Event);
      return Promise.reject(error);
    }

    this.socket.binaryType = 'arraybuffer';

    this.socket.on('open', this.handleSocketOpen);
    this.socket.on('error', this.handleSocketError);
    this.socket.on('close', this.handleSocketClose);
    this.socket.on('message', this.handleSocketMessage);

    return new Promise((resolve, reject) => {
      this.connectResolve = resolve;
      this.connectReject = reject;
    });
  }

  async disconnect(): Promise<void> {
    if (this.socket && this.isOpen()) this.socket.close();
    else return;

    return new Promise((resolve) => {
      this.disconnectResolve = resolve;
    });
  }

  sendAudioBuffer(data: ArrayBufferLike | Blob): void {
    if (this.socket && this.isOpen()) {
      if (data instanceof Blob) {
        // NOTE: Maybe we should add a log message about this potentially being poorer performance in Node
        data.arrayBuffer().then((buf) => this.socket?.send(buf));
      } else {
        this.socket.send(data);
      }
    } else console.error('tried to send audio when socket was closed');
  }

  sendMessage(message: string): void {
    if (this.socket && this.isOpen()) {
      this.socket.send(message);
    } else
      console.error('tried to send message when socket was closed', message);
  }

  isOpen(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private handleSocketOpen = (): void => {
    this.onOpen?.();
    this.connectResolve?.();
  };

  private handleSocketError = (event: ErrorEvent): void => {
    this.connectReject?.(event.error);
    this.onError?.(event.error);
  };

  private handleSocketClose = (): void => {
    if (this.socket) {
      this.socket.off('open', this.handleSocketOpen);
      this.socket.off('error', this.handleSocketError);
      this.socket.off('close', this.handleSocketClose);
      this.socket.off('message', this.handleSocketMessage);
    }

    this.onDisconnect?.();
    this.disconnectResolve?.();
  };

  private handleSocketMessage = (message: MessageEvent): void => {
    if (message.data) this.onMessage?.(JSON.parse(message.data.toString()));
    if (message instanceof Buffer)
      this.onMessage?.(JSON.parse(message.toString()));
  };
}
