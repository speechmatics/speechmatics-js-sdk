import type AudioFormatRaw from './AudioFormatRaw';
import type AudioFormatFile from './AudioFormatFile';
import type TranscriptionConfig from './TranscriptionConfig';
import type TranslationConfig from './TranslationConfig';
import type AudioEventsConfig from './AudioEventsConfig';
interface StartRecognition {
  message: 'StartRecognition';
  audio_format: AudioFormatRaw | AudioFormatFile;
  transcription_config: TranscriptionConfig;
  translation_config?: TranslationConfig;
  audio_events_config?: AudioEventsConfig;
}
export default StartRecognition;
