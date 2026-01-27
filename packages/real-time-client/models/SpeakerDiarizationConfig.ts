import type { SpeakersInputItem } from './SpeakersInputItem';
interface SpeakerDiarizationConfig {
  /**
   * Configure the maximum number of speakers to detect. See [Max Speakers](http://docs.speechmatics.com/speech-to-text/features/diarization#max-speakers).
   */
  max_speakers?: number;
  /**
   * When set to `true`, reduces the likelihood of incorrectly switching between similar sounding speakers.
   * See [Prefer Current Speaker](https://docs.speechmatics.com/speech-to-text/features/diarization#prefer-current-speaker).
   */
  prefer_current_speaker?: boolean;
  speaker_sensitivity?: number;
  /**
   * If true, speaker identifiers will be returned at the end of transcript.
   */
  get_speakers?: boolean;
  /**
   * Use this option to provide speaker labels linked to their speaker identifiers. When passed, the transcription system will tag spoken words in the transcript with the provided speaker labels whenever any of the specified speakers is detected in the audio. A maximum of 50 speakers identifiers across all speakers can be provided.
   */
  speakers?: SpeakersInputItem[];
}
export type { SpeakerDiarizationConfig };
