import { BatchTranscription } from './';
import { SpeechmaticsResponseError } from '../utils/errors';

const originalFetch = global.fetch;
const mockedFetch: jest.Mock<
  ReturnType<typeof global.fetch>,
  Parameters<typeof global.fetch>
> = jest.fn();
global.fetch = mockedFetch;

describe('BatchTranscription', () => {
  afterEach(() => {
    mockedFetch.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('can be initialized with just an API key string', async () => {
    const batch = new BatchTranscription('apiKey');
    expect(batch.apiKey).toBe('apiKey');
  });

  it('can be initialized with a function to get the apiKey', async () => {
    const batch = new BatchTranscription({
      async apiKey() {
        return 'asyncApiKey';
      },
    });
    await batch.refreshApiKey();
    expect(batch.apiKey).toBe('asyncApiKey');
  });

  it('refreshes the API key only once to initialize', async () => {
    const apiKey = jest.fn(async () => 'asyncApiKey');
    const batch = new BatchTranscription({ apiKey });

    mockedFetch.mockImplementation(
      async () => new Response(JSON.stringify({ jobs: [] }), { status: 200 }),
    );
    await batch.listJobs();
    await batch.listJobs();

    expect(apiKey).toBeCalledTimes(1);
  });

  it('refreshes the API key on error and retries', async () => {
    const keys: IterableIterator<string> = ['firstKey', 'secondKey'][
      Symbol.iterator
    ]();
    const apiKey: () => Promise<string> = jest.fn(
      async () => keys.next().value,
    );

    const batch = new BatchTranscription({ apiKey });

    mockedFetch.mockImplementation(async (_url, requestOpts) => {
      const apiKey = JSON.parse(
        JSON.stringify(requestOpts?.headers) ?? '{}',
      ).Authorization?.split('Bearer ')[1];

      if (apiKey === 'firstKey') {
        return new Response('401 unauthorized (mock)', { status: 401 });
      } else {
        return new Response(JSON.stringify({ jobs: [] }), { status: 200 });
      }
    });

    const result = await batch.listJobs();
    expect(apiKey).toBeCalledTimes(2);
    expect(Array.isArray(result.jobs)).toBe(true);
  });

  it('returns a descriptive error when the given API key is invalid', async () => {
    mockedFetch.mockImplementation(async () => {
      return new Response(
        '{"code": 401, "error": "Permission Denied", "mock": true}',
        { status: 401 },
      );
    });

    const batch = new BatchTranscription({ apiKey: 'some-invalid-key' });
    const listJobs = batch.listJobs();
    await expect(listJobs).rejects.toBeInstanceOf(SpeechmaticsResponseError);
    await expect(listJobs).rejects.toMatchInlineSnapshot(
      '[SpeechmaticsResponseError: Permission Denied]',
    );
  });
});
