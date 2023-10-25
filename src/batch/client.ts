import {
  CreateJobResponse,
  RetrieveTranscriptResponse,
  RetrieveJobResponse,
  DeleteJobResponse,
  RetrieveJobsResponse,
  JobConfig,
  DataFetchConfig,
  BatchTranscriptionConfig,
} from '../types';
import { ConnectionConfig, ConnectionConfigFull } from '../config/connection';
import { QueryParams, request, SM_APP_PARAM_NAME } from '../utils/request';
import poll from '../utils/poll';
import RetrieveJobsFilters from '../types/list-job-filters';
import { BatchFeatureDiscovery } from '../types/batch-feature-discovery';
import { SpeechmaticsConfigurationError } from '../utils/errors';

export class BatchTranscription {
  private config: ConnectionConfigFull;
  private _apiKey: string | undefined = undefined;

  get apiKey(): string | undefined {
    return (
      this._apiKey ??
      (typeof this.config.apiKey === 'string' ? this.config.apiKey : undefined)
    );
  }

  async refreshApiKey(): Promise<string> {
    if (typeof this.config.apiKey === 'string') return this.config.apiKey;

    const newKey = await this.config.apiKey();
    this._apiKey = newKey;
    return newKey;
  }

  constructor(config: string | ConnectionConfig) {
    this.config = new ConnectionConfigFull(config);
  }

  private async refreshOnFail<T>(
    doRequest: (key: string) => Promise<T>,
  ): Promise<T> {
    try {
      return await doRequest(this.apiKey ?? (await this.refreshApiKey()));
    } catch (e) {
      console.info('Retrying due to error:', e);
      return await doRequest(await this.refreshApiKey());
    }
  }

  private async get<T, K extends string>(
    endpoint: string,
    contentType?: string,
    queryParams?: QueryParams<K>,
  ): Promise<T> {
    return await this.refreshOnFail((key: string) =>
      request(
        key,
        this.config.batchUrl,
        endpoint,
        'GET',
        null,
        { ...queryParams, [SM_APP_PARAM_NAME]: this.config.appId },
        contentType,
      ),
    );
  }

  private async post<T>(
    endpoint: string,
    body: FormData | null = null,
    contentType?: string,
  ): Promise<T> {
    return await this.refreshOnFail((key: string) =>
      request(
        key,
        this.config.batchUrl,
        endpoint,
        'POST',
        body,
        { [SM_APP_PARAM_NAME]: this.config.appId },
        contentType,
      ),
    );
  }

  private async delete<T, K extends string = string>(
    endpoint: string,
    params?: QueryParams<K>,
  ): Promise<T> {
    return this.refreshOnFail((key: string) =>
      request(key, this.config.batchUrl, endpoint, 'DELETE', null, {
        ...params,
        [SM_APP_PARAM_NAME]: this.config.appId,
      }),
    );
  }

  /**
   * The main method for transcribing audio files. It takes a url or a buffer and returns a promise with a transcript.
   *
   *
   * @param config TranscribeConfig
   * @returns Promise<RetrieveTranscriptResponse>. A promise that resolves to a transcript.
   */
  async transcribe(
    input: JobInput,
    jobConfig: Parameters<typeof this.createTranscriptionJob>[1],
    format?: TranscriptionFormat,
  ): Promise<RetrieveTranscriptResponse | string> {
    if (this.config.apiKey === undefined)
      throw new SpeechmaticsConfigurationError(
        'Missing apiKey in configuration',
      );

    const submitResponse = await this.createTranscriptionJob(input, jobConfig);

    if (submitResponse === null || submitResponse === undefined) {
      throw 'Error: submitResponse is undefined';
    }

    await poll(
      async () => {
        const { job } = await this.getJob(submitResponse.id);
        if (job.status === 'rejected') {
          throw job.errors;
        } else if (job.status === 'done') {
          return true;
        } else {
          return false;
        }
      },
      3000, // repeat every 3 seconds
      15 * 60 * 1000, // 15 minutes timeout
    );

    return await this.getJobResult(submitResponse.id, format);
  }

  async createTranscriptionJob(
    input: JobInput,
    jobConfig: Omit<JobConfig, 'type'> & {
      transcription_config: BatchTranscriptionConfig;
    },
  ): Promise<CreateJobResponse> {
    if (this.config.apiKey === undefined)
      throw new SpeechmaticsConfigurationError(
        'Missing apiKey in configuration',
      );

    const config = {
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

    return this.post('/v2/jobs', formData);
  }

  async listJobs(
    filters: RetrieveJobsFilters = {},
  ): Promise<RetrieveJobsResponse> {
    return this.get('/v2/jobs', 'application/json', filters);
  }

  async getJob(id: string): Promise<RetrieveJobResponse> {
    return this.get(`/v2/jobs/${id}`, 'application/json');
  }

  async deleteJob(id: string, force = false): Promise<DeleteJobResponse> {
    const params = force ? { force } : undefined;
    return this.delete(`/v2/jobs/${id}`, params);
  }

  // No format, defaults to JSON-V2 with response body returned
  async getJobResult(jobId: string): Promise<RetrieveTranscriptResponse>;
  async getJobResult(
    jobId: string,
    format: 'json-v2',
  ): Promise<RetrieveTranscriptResponse>;
  // Text/SRT returns string
  async getJobResult(jobId: string, format: 'text' | 'srt'): Promise<string>;
  // If which precise format is unknown at compile time, could be either response body or string
  async getJobResult(
    jobId: string,
    format?: TranscriptionFormat,
  ): Promise<RetrieveTranscriptResponse | string>;
  async getJobResult(
    jobId: string,
    format: TranscriptionFormat = 'json-v2',
  ): Promise<RetrieveTranscriptResponse | string> {
    const params = { format: format === 'text' ? 'txt' : format };
    const contentType =
      format === 'json-v2' ? 'application/json' : 'text/plain';
    return this.get(`/v2/jobs/${jobId}/transcript`, contentType, params);
  }

  async getDataFile(jobId: string) {
    return this.get(`/v2/jobs/${jobId}/data`, 'application/json');
  }

  async getFeatureDiscovery(): Promise<BatchFeatureDiscovery> {
    return this.get('/v1/discovery/features');
  }
}

export type TranscriptionFormat = 'json-v2' | 'text' | 'srt';

export type JobInput =
  | File
  | { data: Blob; fileName: string }
  | DataFetchConfig;
