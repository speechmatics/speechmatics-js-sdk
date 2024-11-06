// NOTE: This file is copied from realtime-client, not auto-generated

/**
 *
 * @export
 * @interface RecognitionDisplay
 */
export interface RecognitionDisplay {
  /**
   *
   * @type {string}
   * @memberof RecognitionDisplay
   */
  direction: RecognitionDisplayDirectionEnum;
}

export const RecognitionDisplayDirectionEnum = {
  Ltr: 'ltr',
  Rtl: 'rtl',
} as const;

export type RecognitionDisplayDirectionEnum =
  (typeof RecognitionDisplayDirectionEnum)[keyof typeof RecognitionDisplayDirectionEnum];
