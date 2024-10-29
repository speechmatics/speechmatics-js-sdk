import type { CreateJobResponse } from '../models/create-job-response';
import type { RetrieveJobResponse } from '../models/retrieve-job-response';
import type { RetrieveTranscriptResponse } from '../models/retrieve-transcript-response';
import type { RetrieveJobsResponse } from '../models/retrieve-jobs-response';
import type { DeleteJobResponse } from '../models/delete-job-response';
import type { DataFetchConfig } from '../models/data-fetch-config';
import type { JobConfig } from '../models/job-config';
import type { TranscriptionConfig } from '../models/transcription-config';
import type { BatchFeatureDiscovery } from './features';
import { type QueryParams, request, SM_APP_PARAM_NAME } from './request';
import { poll } from './poll';

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
    this.apiUrl = apiUrl ?? 'https://asr.api.speechmatics.com/v2';
    this.appId = appId;
  }

  private async get<T>(
    endpoint: string,
    contentType?: string,
    queryParams?: QueryParams,
  ): Promise<T> {
    return await request(
      this.apiKey,
      this.apiUrl,
      endpoint,
      'GET',
      null,
      { ...queryParams, [SM_APP_PARAM_NAME]: this.appId },
      contentType,
    );
  }

  private async post<T>(
    endpoint: string,
    body: FormData | null = null,
    contentType?: string,
  ): Promise<T> {
    return await request(
      this.apiKey,
      this.apiUrl,
      endpoint,
      'POST',
      body,
      { [SM_APP_PARAM_NAME]: this.appId },
      contentType,
    );
  }

  private async delete<T>(endpoint: string, params?: QueryParams): Promise<T> {
    return request(this.apiKey, this.apiUrl, endpoint, 'DELETE', null, {
      ...params,
      [SM_APP_PARAM_NAME]: this.appId,
    });
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
    timeoutMS?: number,
  ): Promise<RetrieveTranscriptResponse | string> {
    const submitResponse = await this.createTranscriptionJob(input, jobConfig);

    if (submitResponse === null || submitResponse === undefined) {
      throw 'Error: submitResponse is undefined';
    }

    await poll(
      async () => {
        const { job } = await this.getJob(submitResponse.id);
        if (job.status === 'rejected') {
          throw job.errors;
        }
        return job.status === 'done';
      },
      3000, // repeat every 3 seconds
      timeoutMS ?? 15 * 60 * 1000, // 15 minutes timeout default
    );

    return await this.getJobResult(submitResponse.id, format);
  }

  async createTranscriptionJob(
    input: JobInput,
    jobConfig: CreateJobConfig,
  ): Promise<CreateJobResponse> {
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

    return this.post('/v2/jobs', formData);
  }

  async listJobs(
    filters: RetrieveJobsFilters = {},
  ): Promise<RetrieveJobsResponse> {
    return this.get('/v2/jobs', 'application/json', { ...filters });
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

type CreateJobConfig = Omit<JobConfig, 'type' | 'fetch_data'> & {
  transcription_config: TranscriptionConfig;
};

/* Note: This type is based on the schema but it is not in a model.
   Currently we are only generating types for models, but if that changes, we can move this. */
export interface RetrieveJobsFilters {
  created_before?: string;
  limit?: number;
  include_deleted?: boolean;
}
