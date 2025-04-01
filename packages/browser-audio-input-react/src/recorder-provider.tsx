import { context } from './recorder-context';
import { usePCMAudioRecorder } from './use-pcm-audio-recorder';

export function PCMAudioRecorderProvider({
  workletScriptURL,
  children,
  audioContext,
}: {
  workletScriptURL: string;
  children: React.ReactNode;
  audioContext: AudioContext | undefined;
}) {
  const value = usePCMAudioRecorder(workletScriptURL, audioContext);

  return (
    <context.Provider value={{ ...value, audioContext }}>
      {children}
    </context.Provider>
  );
}
