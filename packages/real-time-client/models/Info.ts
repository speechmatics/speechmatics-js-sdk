import type { InfoTypeEnum } from './InfoTypeEnum';
interface Info {
  message: 'Info';
  /**
   * The following are the possible info types:
   *
   * | Info Type | Description |
   * | --- | --- |
   * | `recognition_quality` | Informs the client what particular quality-based model is used to handle the recognition. Sent to the client immediately after the WebSocket handshake is completed.|
   * |`model_redirect`| Informs the client that a deprecated language code has been specified, and will be handled with a different model. For example, if the model parameter is set to one of `en-US`, `en-GB`, or `en-AU`, then the request may be internally redirected to the Global English model (`en`).
   * |`deprecated`| Informs about using a feature that is going to be removed in a future release.
   * |`session_transfer`| Informs that the session has been seamlessly transferred to another backend, with the reason: Session has been transferred to a new backend. This typically occurs due to backend maintenance operations or migration from a faulty backend.
   */
  type: InfoTypeEnum;
  reason: string;
  code?: number;
  seq_no?: number;
  /**
   * Only set when `type` is `recognition_quality`. Quality-based model name. It is one of "telephony", "broadcast". The model is selected automatically, for high-quality audio (12kHz+) the broadcast model is used, for lower quality audio the telephony model is used.
   */
  quality?: string;
  /**
   * Only set when `type` is `concurrent_session_usage`. Indicates the current usage (number of active concurrent sessions).
   */
  usage?: number;
  /**
   * Only set when `type` is `concurrent_session_usage`. Indicates the current quota (maximum number of concurrent sessions allowed).
   */
  quota?: number;
  /**
   * Only set when `type` is `concurrent_session_usage`. Indicates the timestamp of the most recent usage update, in the format `YYYY-MM-DDTHH:MM:SSZ` (UTC). This value is updated even when usage exceeds the quota, as it represents the most recent known data. In some cases, it may be empty or outdated due to internal errors preventing successful update.
   */
  last_updated?: string;
}
export type { Info };
