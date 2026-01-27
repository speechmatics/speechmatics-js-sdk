/**
 * Choose this option to send audio encoded in a recognized format. The AddAudio messages have to provide all the file contents, including any headers. The file is usually not accepted all at once, but segmented into reasonably sized messages.
 *
 * Note: Only the following formats are supported: `wav`, `mp3`, `aac`, `ogg`, `mpeg`, `amr`, `m4a`, `mp4`, `flac`
 */
interface FileType {
  type: 'file';
}
export type { FileType };
