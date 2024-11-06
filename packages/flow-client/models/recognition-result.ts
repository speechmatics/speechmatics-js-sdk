// NOTE: This file is copied from realtime-client, not auto-generated

import type { RecognitionAlternative } from './recognition-alternative';

/**
 *
 * @export
 * @interface RecognitionResult
 */
export interface RecognitionResult {
  /**
   *
   * @type {string}
   * @memberof RecognitionResult
   */
  type: RecognitionResultTypeEnum;
  /**
   *
   * @type {number}
   * @memberof RecognitionResult
   */
  start_time: number;
  /**
   *
   * @type {number}
   * @memberof RecognitionResult
   */
  end_time: number;
  /**
   *
   * @type {string}
   * @memberof RecognitionResult
   */
  channel?: string;
  /**
   *
   * @type {string}
   * @memberof RecognitionResult
   */
  attaches_to?: RecognitionResultAttachesToEnum;
  /**
   *
   * @type {boolean}
   * @memberof RecognitionResult
   */
  is_eos?: boolean;
  /**
   *
   * @type {Array<RecognitionAlternative>}
   * @memberof RecognitionResult
   */
  alternatives?: Array<RecognitionAlternative>;
  /**
   *
   * @type {number}
   * @memberof RecognitionResult
   */
  score?: number;
  /**
   *
   * @type {number}
   * @memberof RecognitionResult
   */
  volume?: number;
}

export const RecognitionResultTypeEnum = {
  Word: 'word',
  Punctuation: 'punctuation',
} as const;

export type RecognitionResultTypeEnum =
  (typeof RecognitionResultTypeEnum)[keyof typeof RecognitionResultTypeEnum];
export const RecognitionResultAttachesToEnum = {
  Next: 'next',
  Previous: 'previous',
  None: 'none',
  Both: 'both',
} as const;

export type RecognitionResultAttachesToEnum =
  (typeof RecognitionResultAttachesToEnum)[keyof typeof RecognitionResultAttachesToEnum];
