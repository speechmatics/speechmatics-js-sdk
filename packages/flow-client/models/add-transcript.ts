// NOTE: This file is copied from realtime-client, not auto-generated

import type { RecognitionMetadata } from '../models';
import type { RecognitionResult } from '../models';

/**
 *
 * @export
 * @interface AddTranscript
 */
export interface AddTranscript {
  /**
   *
   * @type {string}
   * @memberof AddTranscript
   */
  message: AddTranscriptMessageEnum;
  /**
   * Speechmatics JSON output format version number.
   * @type {string}
   * @memberof AddTranscript
   */
  format?: string;
  /**
   *
   * @type {RecognitionMetadata}
   * @memberof AddTranscript
   */
  metadata: RecognitionMetadata;
  /**
   *
   * @type {Array<RecognitionResult>}
   * @memberof AddTranscript
   */
  results: Array<RecognitionResult>;
}

export const AddTranscriptMessageEnum = {
  AddTranscript: 'AddTranscript',
} as const;

export type AddTranscriptMessageEnum =
  (typeof AddTranscriptMessageEnum)[keyof typeof AddTranscriptMessageEnum];
