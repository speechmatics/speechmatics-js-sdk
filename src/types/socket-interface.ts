import { ModelError, RealtimeMessage } from './models';

export interface ISocketWrapper {
  onMessage?: (data: RealtimeMessage) => void;
  onError?: (event: ModelError) => void;
  onDisconnect?: (event: CloseEvent) => void;
  onOpen?: (event: Event) => void;
  connect(url: string, authToken?: string, appId?: string): Promise<void>;
  disconnect(): Promise<void>;
  sendAudioBuffer(buffer: ArrayBufferLike | Blob): void;
  sendMessage(message: string): void;
  isOpen(): boolean;
}
