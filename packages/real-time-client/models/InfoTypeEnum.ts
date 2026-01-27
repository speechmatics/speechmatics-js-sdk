/**
 * The following are the possible info types:
 *
 * | Info Type | Description |
 * | --- | --- |
 * | `recognition_quality` | Informs the client what particular quality-based model is used to handle the recognition. Sent to the client immediately after the WebSocket handshake is completed.|
 * | `concurrent_session_usage` | Informs the client of their quota for concurrent sessions and how much of it they are using. Sent to the client immediately after the WebSocket handshake is completed.|
 */
type InfoTypeEnum = 'recognition_quality' | 'concurrent_session_usage';
export type { InfoTypeEnum };
