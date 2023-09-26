import {
  addQueryParamsToUrl,
  getSmSDKVersion,
  SM_APP_PARAM_NAME,
  SM_SDK_PARAM_NAME,
} from '../utils/request';
import { ISocketWrapper } from '../types';
import { ModelError, RealtimeMessage } from '../types';

/**
 * Wraps the socket api to be more useful in async/await kind of scenarios
 */
export class WebSocketWrapper implements ISocketWrapper {
  private socket?: WebSocket;
  private connectResolve?: () => void;
  private connectReject?: (event: Event) => void;
  private disconnectResolve?: () => void;

  onDisconnect?: () => void;

  onMessage?: (data: RealtimeMessage) => void;
  onError?: (event: ModelError) => void;

  constructor() {
    if (typeof chrome.runtime === 'undefined' )
      throw new Error('chrome is undefined - are you running in a background script?');
  }

  async connect(
    runtimeURL: string,
    authToken?: string,
    appId?: string,
  ): Promise<void> {
    const url = addQueryParamsToUrl(runtimeURL, {
      jwt: authToken,
      [SM_SDK_PARAM_NAME]: getSmSDKVersion(),
      [SM_APP_PARAM_NAME]: appId,
    });

    try {
      this.socket = new WebSocket(url);
    } catch (error) {
      this.connectReject?.(error as Event);
      return Promise.reject(error);
    }

    this.socket.binaryType = 'arraybuffer';

    this.socket.addEventListener('open', this.handleSocketOpen);
    this.socket.addEventListener('error', this.handleSocketError);
    this.socket.addEventListener('close', this.handleSocketClose);
    this.socket.addEventListener('message', this.handleSocketMessage);

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

  sendAudioBuffer(buffer: ArrayBufferLike | Blob): void {
    if (this.socket && this.isOpen()) {
      this.socket.send(buffer);
    } else console.error('Tried to send audio when socket was closed');
  }

  sendMessage(message: string): void {
    if (this.socket && this.isOpen()) {
      this.socket.send(message);
    } else
      console.error('Tried to send message when socket was closed', message);
  }

  isOpen(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private handleSocketOpen = (): void => {
    this.connectResolve?.();
  };

  private handleSocketError = (event: Event): void => {
    // this.connectReject?.(event);
    this.onError?.((event as ErrorEvent).error);
  };

  private handleSocketClose = (): void => {
    if (this.socket) {
      this.socket.removeEventListener('open', this.handleSocketOpen);
      this.socket.removeEventListener('error', this.handleSocketError);
      this.socket.removeEventListener('close', this.handleSocketClose);
      this.socket.removeEventListener('message', this.handleSocketMessage);
    }

    this.onDisconnect?.();
    this.disconnectResolve?.();
  };

  private handleSocketMessage = (event: MessageEvent): void => {
    this.onMessage?.(JSON.parse(event.data));
  };
}
