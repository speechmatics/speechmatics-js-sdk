import { RealtimeSession } from './client';

describe('RealtimeTranscription', () => {
  let session: RealtimeSession;

  beforeEach(() => {
    session = new RealtimeSession('apiKey');
  });

  it('should create a new RealtimeTranscription instance', () => {
    expect(session).toBeInstanceOf(RealtimeSession);
  });
});

describe('RealtimeSession', () => {
  let realtimeSession: RealtimeSession;

  beforeEach(() => {
    realtimeSession = new RealtimeSession('apiKey');
  });

  it('should start and stop the realtime session', async () => {
    // Mock the methods related to the socket connection and recognition
    realtimeSession.rtSocketHandler.connect = jest
      .fn()
      .mockResolvedValue(undefined);
    realtimeSession.rtSocketHandler.startRecognition = jest
      .fn()
      .mockResolvedValue(undefined);
    realtimeSession.rtSocketHandler.stopRecognition = jest
      .fn()
      .mockResolvedValue(undefined);

    await realtimeSession.start();
    expect(realtimeSession.rtSocketHandler.connect).toHaveBeenCalled();
    expect(realtimeSession.rtSocketHandler.startRecognition).toHaveBeenCalled();

    await realtimeSession.stop();
    expect(realtimeSession.rtSocketHandler.stopRecognition).toHaveBeenCalled();
  });

  it('should send audio data to the server', () => {
    const audioData = new Float32Array([0.1, 0.2, 0.3, 0.4]);
    realtimeSession.rtSocketHandler.sendAudioBuffer = jest.fn();

    realtimeSession.sendAudio(audioData);
    expect(
      realtimeSession.rtSocketHandler.sendAudioBuffer,
    ).toHaveBeenCalledWith(audioData);
  });

  it('should check if the session is connected', () => {
    realtimeSession.rtSocketHandler.isConnected = jest
      .fn()
      .mockReturnValue(true);

    const isConnected = realtimeSession.isConnected();
    expect(isConnected).toBe(true);
    expect(realtimeSession.rtSocketHandler.isConnected).toHaveBeenCalled();
  });
});
