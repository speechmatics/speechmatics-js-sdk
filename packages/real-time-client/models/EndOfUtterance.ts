import type EndOfUtteranceMetadata from './EndOfUtteranceMetadata';
interface EndOfUtterance {
  message: 'EndOfUtterance';
  metadata: EndOfUtteranceMetadata;
}
export default EndOfUtterance;
