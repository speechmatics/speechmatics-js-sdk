import { RealtimeSocketHandler, Subscriber } from './handlers';
import { EndOfTranscript, ISocketWrapper } from '../types';
import {
  RealtimeTranscriptionConfig,
  ModelError,
  RealtimeMessageMessageEnum as MessagesEnum,
  RecognitionStarted,
} from '../types';
import { getSmSDKVersion } from '../utils/request';

describe('RealtimeSocketHandler', () => {
  let mockSocketWrapper: jest.Mocked<ISocketWrapper>;
  let mockSubscriber: jest.Mocked<Subscriber>;
  let realtimeSocketHandler: RealtimeSocketHandler;

  beforeEach(() => {
    mockSocketWrapper = {
      connect: jest.fn(),
      onOpen: jest.fn(),
      disconnect: jest.fn(),
      isOpen: jest.fn(),
      sendAudioBuffer: jest.fn(),
      sendMessage: jest.fn(),
      onMessage: jest.fn(),
      onError: jest.fn(),
      onDisconnect: jest.fn(),
    } as unknown as jest.Mocked<ISocketWrapper>;

    mockSubscriber = {
      onRecognitionStart: jest.fn(),
      onRecognitionEnd: jest.fn(),
      onFullReceived: jest.fn(),
      onPartialReceived: jest.fn(),
      onWarning: jest.fn(),
      onError: jest.fn(),
      onInfo: jest.fn(),
      onDisconnect: jest.fn(),
    };

    realtimeSocketHandler = new RealtimeSocketHandler(
      mockSubscriber,
      mockSocketWrapper,
    );
  });

  // TODO: we should figure out better tests for the node/browser case. This test only tests a very small piece of implementation anyway
  test.skip('connect', async () => {
    const runtimeURL = 'wss://example.com';
    const runtimeKey = 'some-key';
    await realtimeSocketHandler.connect(runtimeURL, runtimeKey);
    expect(mockSocketWrapper.connect).toHaveBeenCalledWith(
      `${runtimeURL}/?jwt=${runtimeKey}&sm-sdk=${getSmSDKVersion()}`,
    );
  });

  test('disconnect', async () => {
    await realtimeSocketHandler.disconnect();
    expect(mockSocketWrapper.disconnect).toHaveBeenCalled();
  });

  test('isConnected', () => {
    realtimeSocketHandler.isConnected();
    expect(mockSocketWrapper.isOpen).toHaveBeenCalled();
  });

  test('sendAudioBuffer', () => {
    const data: ArrayBufferLike = new ArrayBuffer(0);
    realtimeSocketHandler.sendAudioBuffer(data);
    expect(mockSocketWrapper.sendAudioBuffer).toHaveBeenCalledWith(data);
  });

  test('startRecognition', async () => {
    const transcription_config: RealtimeTranscriptionConfig = {
      language: 'en',
      max_delay: 5,
      enable_partials: true,
    };
    const startRecognitionPromise = realtimeSocketHandler.startRecognition({
      transcription_config,
    });
    mockSocketWrapper.onMessage?.({ message: MessagesEnum.RecognitionStarted });

    await expect(startRecognitionPromise).resolves.toEqual({
      message: 'RecognitionStarted',
    } as RecognitionStarted);
    expect(mockSubscriber.onRecognitionStart).toHaveBeenCalled();
  }, 20000);

  test('stopRecognition', async () => {
    mockSocketWrapper.isOpen.mockReturnValue(true);

    const stopRecognitionPromise = realtimeSocketHandler.stopRecognition();
    mockSocketWrapper.onMessage?.({ message: MessagesEnum.EndOfTranscript });
    await expect(stopRecognitionPromise).resolves.toBeUndefined();
    expect(mockSubscriber.onRecognitionEnd).toHaveBeenCalled();
    expect(mockSocketWrapper.disconnect).toHaveBeenCalled();
  }, 20000);

  test('stopRecognition is called in the connecting phase', async () => {
    const stopMessage: string = JSON.stringify({
      message: MessagesEnum.EndOfStream,
      last_seq_no: 0,
    });

    realtimeSocketHandler.startRecognition();
    realtimeSocketHandler.stopRecognition();

    mockSocketWrapper.onOpen?.({} as Event);

    expect(mockSocketWrapper.sendMessage).toHaveBeenCalledWith(stopMessage);
  }, 5000);

  test('onSocketMessage error', () => {
    const error: ModelError = {
      message: MessagesEnum.Error,
      reason: 'Error occurred',
      type: 'data_error',
    };
    // rome-ignore lint/complexity/useLiteralKeys: lets us test the private methods
    realtimeSocketHandler['onSocketMessage'](error);
    expect(mockSubscriber.onError).toHaveBeenCalledWith(error);
  });

  test('onSocketDisconnect', () => {
    // rome-ignore lint/complexity/useLiteralKeys: lets us test the private methods
    realtimeSocketHandler['onSocketDisconnect']();
    expect(mockSubscriber.onDisconnect).toHaveBeenCalled();
  });

  test('onSocketError', () => {
    const error: ModelError = {
      message: MessagesEnum.Error,
      reason: 'Error occurred',
      type: 'data_error',
    };
    // rome-ignore lint/complexity/useLiteralKeys: lets us test the private methods
    realtimeSocketHandler['onSocketError'](error);
    expect(mockSubscriber.onError).toHaveBeenCalledWith(error);
  });
});
