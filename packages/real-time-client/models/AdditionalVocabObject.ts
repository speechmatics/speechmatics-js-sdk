/**
 * Pass an object to add a single word to the dictionary, with an array of words which it sounds like.
 */
interface AdditionalVocabObject {
  content: string;
  sounds_like?: string[];
}
export type { AdditionalVocabObject };
