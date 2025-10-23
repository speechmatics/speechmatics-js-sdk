interface SpeakersInputItem {
  /**
   * Speaker label, which must not match the format used internally (e.g. S1, S2, etc)
   */
  label: string;
  speaker_identifiers: string[];
}
export type { SpeakersInputItem };
