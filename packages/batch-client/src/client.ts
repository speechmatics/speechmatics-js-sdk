import type { CreateJobResponse } from '../models/create-job-response';
import type { RetrieveJobResponse } from '../models/retrieve-job-response';
import type { RetrieveTranscriptResponse } from '../models/retrieve-transcript-response';
import type { RetrieveJobsResponse } from '../models/retrieve-jobs-response';
import type { JobDetails } from '../models/job-details';
import type { DeleteJobResponse } from '../models/delete-job-response';
import type { DataFetchConfig } from '../models/data-fetch-config';
import type { JobConfig } from '../models/job-config';
import type { TranscriptionConfig } from '../models/transcription-config';
import type { BatchFeatureDiscovery } from './features';
import { type QueryParams, request, SM_APP_PARAM_NAME } from './request';
import {
  SpeechmaticsConfigurationError,
  SpeechmaticsJobFailedError,
} from './errors';

export class BatchClient {
  public apiKey: string;
  private apiUrl: string;
  public readonly appId: string;

  constructor({
    apiKey,
    apiUrl,
    appId,
  }: { apiKey: string; apiUrl?: string; appId: string }) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl ?? 'https://asr.api.speechmatics.com';
    this.appId = appId;
  }

  private async get<T>(
    endpoint: string,
    contentType?: string,
    queryParams?: QueryParams,
    signal?: AbortSignal,
  ): Promise<T> {
    return await request(
      this.apiKey,
      this.apiUrl,
      endpoint,
      'GET',
      null,
      { ...queryParams, [SM_APP_PARAM_NAME]: this.appId },
      contentType,
      signal,
    );
  }

  private async post<T>(
    endpoint: string,
    body: FormData | null = null,
    contentType?: string,
    queryParams?: QueryParams,
    signal?: AbortSignal,
  ): Promise<T> {
    return await request(
      this.apiKey,
      this.apiUrl,
      endpoint,
      'POST',
      body,
      { ...queryParams, [SM_APP_PARAM_NAME]: this.appId },
      contentType,
      signal,
    );
  }

  private async delete<T>(endpoint: string, params?: QueryParams): Promise<T> {
    return request(this.apiKey, this.apiUrl, endpoint, 'DELETE', null, {
      ...params,
      [SM_APP_PARAM_NAME]: this.appId,
    });
  }

  /**
   * Submit a file for transcription and resolve with the transcript once the job is done.
   *
   * This uses the API's synchronous `wait` option: the job is created with `wait` set, so short files
   * typically complete in a single request. If the job is still running when the wait elapses,
   * the job status is re-requested (again with `wait`) until it reaches a terminal state.
   *
   * To give up after a certain time, pass an `AbortSignal`, e.g. `{ signal: AbortSignal.timeout(15 * 60_000) }`.
   * Note that aborting only stops the client from waiting; the job itself continues server-side.
   *
   * @throws {SpeechmaticsJobFailedError} if the job is rejected, deleted or expired.
   * @returns The transcript: a JSON object for `json-v2` (default), or a string for `txt` and `srt`.
   */
  async transcribe<F extends TranscriptionFormat = 'json-v2'>(
    input: JobInput,
    jobConfig: CreateJobConfig,
    options: TranscribeOptions<F> = {},
  ): Promise<TranscriptResult<F>> {
    const {
      format = 'json-v2' as F,
      wait = DEFAULT_TRANSCRIBE_WAIT_SECONDS,
      signal,
    } = options;

    const created = await this.createTranscriptionJob(input, jobConfig, {
      wait,
      format,
      signal,
    });

    if (created.status === 'done') {
      // The embedded transcript is best-effort, so fall through to fetching it if absent
      const embedded = (created as Partial<Record<F, TranscriptResult<F>>>)[
        format
      ];
      if (embedded !== undefined) return embedded;
    }

    // Servers without `wait` support (e.g. on-prem) return no `status`,
    // in which case this degrades into a regular polling loop.
    let status: string | undefined = created.status;
    let job: JobDetails | undefined;
    while (status === undefined || !isTerminal(status)) {
      const start = Date.now();
      ({ job } = await this.getJob(created.id, { wait, signal }));
      status = job.status;
      if (!isTerminal(status)) {
        // Guard against tight loops if the server returned early
        await sleep(MIN_POLL_INTERVAL_MS - (Date.now() - start), signal);
      }
    }

    if (status !== 'done') {
      if (!job) {
        job = await this.getJob(created.id, { wait: 0, signal }).then(
          (r) => r.job,
          () => undefined,
        );
      }
      throw new SpeechmaticsJobFailedError(created.id, status, job);
    }

    return this.getJobResult(created.id, format, { wait, signal });
  }

  /**
   * Create a transcription job.
   *
   * Without `wait`, this resolves as soon as the job is created, with just the job `id`.
   *
   * With `wait` (in seconds), the request blocks until the job reaches a terminal state or the wait elapses
   * (the server caps this at its own configured limit). The response then includes a `status`, and if the
   * status is `done`, the transcript is (on a best-effort basis) embedded under the key named after `format`.
   * If the status is `created`, the job is still running: use {@link getJob} or {@link getJobResult}
   * with `wait` to keep waiting.
   */
  async createTranscriptionJob(
    input: JobInput,
    jobConfig: CreateJobConfig,
    options?: { wait?: undefined; signal?: AbortSignal },
  ): Promise<CreateJobResponse>;
  async createTranscriptionJob<F extends TranscriptionFormat = 'json-v2'>(
    input: JobInput,
    jobConfig: CreateJobConfig,
    options: CreateJobWaitOptions<F>,
  ): Promise<CreateJobWaitResponse<F>>;
  async createTranscriptionJob(
    input: JobInput,
    jobConfig: CreateJobConfig,
    options: {
      wait?: number;
      format?: TranscriptionFormat;
      signal?: AbortSignal;
    } = {},
  ): Promise<CreateJobResponse | CreateJobWaitResponse<TranscriptionFormat>> {
    if (jobConfig.transcription_config?.operating_point) {
      console.warn(
        '[Speechmatics] transcription_config.operating_point is deprecated. Use transcription_config.model instead.',
      );
    }

    const config: JobConfig = {
      ...jobConfig,
      type: 'transcription',
    };

    const formData = new FormData();
    if ('url' in input) {
      config.fetch_data = input;
    } else if ('data' in input) {
      formData.append('data_file', input.data, input.fileName);
    } else {
      formData.append('data_file', input);
    }
    formData.append('config', JSON.stringify(config));

    const { wait, format, signal } = options;
    const params =
      wait === undefined ? {} : { wait: validateWait(wait), format };

    return this.post('/v2/jobs', formData, undefined, params, signal);
  }

  async listJobs(
    filters: RetrieveJobsFilters = {},
  ): Promise<RetrieveJobsResponse> {
    return this.get('/v2/jobs', 'application/json', { ...filters });
  }

  /**
   * Get the details of a job.
   *
   * If `wait` (in seconds) is set, the request blocks until the job reaches a terminal state or the wait elapses,
   * returning the job in its current state either way. Note that if `wait` is omitted, the server applies a short
   * default wait: pass `wait: 0` to return immediately.
   */
  async getJob(
    id: string,
    { wait, signal }: WaitOptions = {},
  ): Promise<RetrieveJobResponse> {
    const params = wait === undefined ? {} : { wait: validateWait(wait) };
    return this.get(`/v2/jobs/${id}`, 'application/json', params, signal);
  }

  async deleteJob(id: string, force = false): Promise<DeleteJobResponse> {
    const params = force ? { force } : undefined;
    return this.delete(`/v2/jobs/${id}`, params);
  }

  /**
   * Get the transcript of a job, as a JSON object for `json-v2` (default), or a string for `txt` and `srt`.
   *
   * If `wait` (in seconds) is set, the request blocks until the transcript is ready or the wait elapses.
   * If the transcript is still not ready, a {@link SpeechmaticsResponseError} is thrown with
   * error `Transcription not ready` (HTTP 404), and the request can be retried to keep waiting.
   * Note that if `wait` is omitted, the server applies a short default wait: pass `wait: 0` to return immediately.
   */
  async getJobResult<F extends TranscriptionFormat = 'json-v2'>(
    jobId: string,
    format: F = 'json-v2' as F,
    { wait, signal }: WaitOptions = {},
  ): Promise<TranscriptResult<F>> {
    const params = {
      format,
      ...(wait === undefined ? {} : { wait: validateWait(wait) }),
    };
    const contentType =
      format === 'json-v2' ? 'application/json' : 'text/plain';
    return this.get(
      `/v2/jobs/${jobId}/transcript`,
      contentType,
      params,
      signal,
    );
  }

  async getDataFile(jobId: string) {
    return this.get(`/v2/jobs/${jobId}/data`, 'application/json');
  }

  async getFeatureDiscovery(): Promise<BatchFeatureDiscovery> {
    return this.get('/v1/discovery/features');
  }
}

/** Default `wait` used by {@link BatchClient.transcribe} for each request, in seconds */
export const DEFAULT_TRANSCRIBE_WAIT_SECONDS = 60;

const MIN_POLL_INTERVAL_MS = 1000;

const TERMINAL_STATUSES: readonly string[] = [
  'done',
  'rejected',
  'deleted',
  'expired',
];

function isTerminal(status: string) {
  return TERMINAL_STATUSES.includes(status);
}

function validateWait(wait: number): number {
  if (!Number.isInteger(wait) || wait < 0) {
    throw new SpeechmaticsConfigurationError(
      `wait must be a non-negative integer number of seconds, got ${wait}`,
    );
  }
  return wait;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  signal?.throwIfAborted();
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export type TranscriptionFormat = 'json-v2' | 'txt' | 'srt';

/** `json-v2` transcripts are returned as JSON objects, other formats as strings */
export type TranscriptResult<F extends TranscriptionFormat> =
  F extends 'json-v2' ? RetrieveTranscriptResponse : string;

export interface WaitOptions {
  /**
   * Number of seconds to block for, waiting for the job to finish, before responding.
   * The server caps this at its own configured limit.
   */
  wait?: number;
  /** Abort the request. Note this does not cancel the job itself. */
  signal?: AbortSignal;
}

export interface CreateJobWaitOptions<F extends TranscriptionFormat>
  extends WaitOptions {
  wait: number;
  /** Format of the transcript embedded in the response if the job completes within `wait`. Defaults to `json-v2`. */
  format?: F;
}

export interface TranscribeOptions<F extends TranscriptionFormat>
  extends WaitOptions {
  /** Format of the returned transcript. Defaults to `json-v2`. */
  format?: F;
  /**
   * Seconds to wait on each request before re-requesting the job status.
   * Defaults to {@link DEFAULT_TRANSCRIBE_WAIT_SECONDS}.
   * You may want to lower this if a proxy between you and the API closes idle connections.
   */
  wait?: number;
}

/**
 * Response from creating a job with `wait` set.
 *
 * - `done`: the job finished. The transcript is embedded under the key named after the requested format,
 *   but this is best-effort: if absent, fetch it with {@link BatchClient.getJobResult}.
 * - `created`: the wait elapsed while the job was still running.
 * - `rejected` / `deleted`: the job failed. Use {@link BatchClient.getJob} for details.
 */
export type CreateJobWaitResponse<F extends TranscriptionFormat = 'json-v2'> =
  | { id: string; status: 'created' | 'rejected' | 'deleted' }
  | ({ id: string; status: 'done' } & {
      [K in F]?: TranscriptResult<K>;
    });

export type JobInput =
  | File
  | { data: Blob; fileName: string }
  | DataFetchConfig;

export type CreateJobConfig = Omit<JobConfig, 'type' | 'fetch_data'> & {
  transcription_config: TranscriptionConfig;
};

/* Note: This type is based on the schema but it is not in a model.
   Currently we are only generating types for models, but if that changes, we can move this. */
export interface RetrieveJobsFilters {
  created_before?: string;
  limit?: number;
  include_deleted?: boolean;
}
