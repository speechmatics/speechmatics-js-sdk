import { RealtimeSession } from './realtime/client';
import { ConnectionConfig, ConnectionConfigFull } from './config/connection';
import { BatchTranscription } from './batch';

export class Speechmatics {
  private _connectionConfig: ConnectionConfigFull;
  private _batch: BatchTranscription | null = null;

  constructor(config: string | ConnectionConfig) {
    this._connectionConfig = new ConnectionConfigFull(config);
  }

  get batch() {
    if (this._batch === null) {
      this._batch = new BatchTranscription(this._connectionConfig);
    }
    return this._batch;
  }

  realtime(config?: string | ConnectionConfig) {
    let conf: Partial<ConnectionConfig> | null = {};
    if (typeof config === 'string') {
      conf = { apiKey: config };
    } else if (typeof config === 'object') {
      conf = config;
    }
    return new RealtimeSession({ ...this._connectionConfig, ...(conf || {}) });
  }
}

// rome-ignore lint/suspicious/noExplicitAny: this is for browser script tag to be visible in the global scope
(globalThis as any).Speechmatics = Speechmatics;
