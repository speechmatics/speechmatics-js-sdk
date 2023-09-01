import { Speechmatics } from './client';
import { RealtimeSession } from './realtime/client';
import { BatchTranscription } from './batch';
import { ConnectionConfigFull } from './config/connection';

describe('Speechmatics', () => {
  const apiKey = 'test-api-key';
  const overrides = {
    batchUrl: 'http://batch.example.com/',
    realtimeUrl: 'http://realtime.example.com/',
    managementPlatformUrl: 'http://management.example.com',
  };

  it('should create a new Speechmatics instance', () => {
    const speechmatics = new Speechmatics(apiKey);
    expect(speechmatics).toBeInstanceOf(Speechmatics);
  });

  it('should create a BatchTranscription instance when accessing the batch property', () => {
    const speechmatics = new Speechmatics(apiKey);
    const batch = speechmatics.batch;
    expect(batch).toBeInstanceOf(BatchTranscription);
  });

  it('should create a RealtimeTranscription instance when calling the realtime method', () => {
    const speechmatics = new Speechmatics(apiKey);
    expect(speechmatics.realtime()).toBeInstanceOf(RealtimeSession);
  });

  it('should use the provided apiKey and overrides when creating ConnectionConfig', () => {
    const sm = new Speechmatics({ apiKey, ...overrides });

    expect(sm).toBeInstanceOf(Speechmatics);

    const connConfig = sm.realtime().connectionConfig; //trick to access private property

    expect(connConfig).toBeInstanceOf(ConnectionConfigFull);
    expect(connConfig.apiKey).toEqual(apiKey);
    expect(connConfig.batchUrl).toEqual(overrides.batchUrl);
  });
});
