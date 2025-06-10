import type RecognitionDisplay from './RecognitionDisplay';
interface RecognitionAlternative {
  content: string;
  confidence: number;
  language?: string;
  display?: RecognitionDisplay;
  speaker?: string;
}
export default RecognitionAlternative;
