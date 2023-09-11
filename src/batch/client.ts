import {
  CreateJobResponse,
  RetrieveTranscriptResponse,
  RetrieveJobResponse,
  DeleteJobResponse,
  RetrieveJobsResponse,
  JobConfig,
  DataFetchConfig,
} from '../types';
import { ConnectionConfig, ConnectionConfigFull } from '../config/connection';
import { QueryParams, request, SM_APP_PARAM_NAME } from '../utils/request';
import waitUntilAvail from '../utils/wait-until-avail';
import RetrieveJobsFilters from '../types/list-job-filters';
import { BatchFeatureDiscovery } from '../types/batch-feature-discovery';
import { ISO639_1_Language } from '../types/language-code';
import { ReadStream } from 'fs';

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
  async transcribe({
    input,
    transcription_config,
    translation_config,
    output_config,
    summarization_config,
    format = 'json-v2',
  }: TranscribeConfig): Promise<RetrieveTranscriptResponse> {
    if (this.config.apiKey === undefined)
      throw new Error('Error: apiKey is undefined');

    const fileOrFetchConfig = 'fetch' in input ? input.fetch : input;

    const submitResponse = await this.createJob({
      input: fileOrFetchConfig,
      transcription_config,
      translation_config,
      output_config,
      summarization_config,
    });

    if (submitResponse === null || submitResponse === undefined) {
      throw 'Error: submitResponse is undefined';
    }

    await waitUntilAvail(
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
    ).catch((error) => {
      throw error;
    });

    const jobResult = await this.getJobResult(submitResponse.id, format).catch(
      (err) => {
        throw err;
      },
    );

    return new Promise((resolve, reject) => {
      if (jobResult != null) resolve(jobResult);
      else reject('Error: jobResult is null');
    });
  }

  async createJob({
    input,
    transcription_config,
    translation_config,
    output_config,
    summarization_config,
  }: CreateJobConfig): Promise<CreateJobResponse> {
    if (this.config.apiKey === undefined)
      throw new Error('Error: apiKey is undefined');

    const config: JobConfig = {
      type: 'transcription',
      transcription_config,
      translation_config,
      output_config,
      summarization_config,
    };

    const formData = new FormData();
    if ('url' in input) {
      config.fetch_data = input;
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

  async getJobResult<F extends 'text' | 'json-v2' | 'srt'>(
    jobId: string,
    format: F,
  ): Promise<F extends 'json-v2' ? RetrieveTranscriptResponse : string> {
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

export type TranscribeConfig = Omit<JobConfig, 'type'> & {
  input: Blob | { fetch: DataFetchConfig };
  language?: ISO639_1_Language;
  format?: 'json-v2' | 'text' | 'srt';
};

export type CreateJobConfig = Omit<JobConfig, 'type'> & {
  input: Blob | DataFetchConfig;
};
