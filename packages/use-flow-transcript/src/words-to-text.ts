import type { Word } from './types';

/**
 * Utility function to convert an array of words into readable text
 * Handles spacing between words and punctuation
 */
export function wordsToText(words: readonly Word[]): string {
  return words.reduce(
    (text, word) =>
      `${text}${words.indexOf(word) > 0 && !word.punctuation ? ' ' : ''}${word.text}`,
    '',
  );
}
