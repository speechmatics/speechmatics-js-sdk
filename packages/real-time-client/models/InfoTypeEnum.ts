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
type InfoTypeEnum =
  | 'recognition_quality'
  | 'model_redirect'
  | 'deprecated'
  | 'concurrent_session_usage';
export type { InfoTypeEnum };
