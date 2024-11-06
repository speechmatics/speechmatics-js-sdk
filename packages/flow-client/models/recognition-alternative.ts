// NOTE: This file is copied from realtime-client, not auto-generated

import type { RecognitionDisplay } from '../models';

/**
 *
 * @export
 * @interface RecognitionAlternative
 */
export interface RecognitionAlternative {
  /**
   *
   * @type {string}
   * @memberof RecognitionAlternative
   */
  content: string;
  /**
   *
   * @type {number}
   * @memberof RecognitionAlternative
   */
  confidence: number;
  /**
   *
   * @type {string}
   * @memberof RecognitionAlternative
   */
  language?: string;
  /**
   *
   * @type {RecognitionDisplay}
   * @memberof RecognitionAlternative
   */
  display?: RecognitionDisplay;
  /**
   *
   * @type {string}
   * @memberof RecognitionAlternative
   */
  speaker?: string;
}
