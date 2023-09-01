export class ConnectionConfigFull implements ConnectionConfig {
  apiKey: string | (() => Promise<string>);
  batchUrl = 'https://asr.api.speechmatics.com/v2';
  realtimeUrl = 'wss://eu2.rt.speechmatics.com/v2';
  managementPlatformUrl = 'https://mp.speechmatics.com/v1';
  appId?: string;

  constructor(config: string | ConnectionConfig) {
    if (typeof config === 'string') {
      this.apiKey = config;
    } else {
      this.apiKey = config.apiKey;
      if (config.batchUrl) this.batchUrl = config.batchUrl;
      if (config.realtimeUrl) this.realtimeUrl = config.realtimeUrl;
      if (config.managementPlatformUrl)
        this.managementPlatformUrl = config.managementPlatformUrl;
      if (config.apiKey) this.apiKey = config.apiKey;
      this.appId = config.appId;
    }
  }
}

export interface ConnectionConfig {
  apiKey: string | (() => Promise<string>);
  batchUrl?: string;
  realtimeUrl?: string;
  managementPlatformUrl?: string;
  appId?: string;
}
