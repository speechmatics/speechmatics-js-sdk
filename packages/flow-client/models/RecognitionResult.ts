import type { TypeEnum } from './TypeEnum';
import type { AttachesToEnum } from './AttachesToEnum';
import type { RecognitionAlternative } from './RecognitionAlternative';
interface RecognitionResult {
  type: TypeEnum;
  start_time: number;
  end_time: number;
  channel?: string;
  attaches_to?: AttachesToEnum;
  is_eos?: boolean;
  alternatives?: RecognitionAlternative[];
  score?: number;
  volume?: number;
}
export type { RecognitionResult };
