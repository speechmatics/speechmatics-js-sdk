import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

interface IAudioContextContext {
  audioContext: AudioContext | null;
}

const AudioContextContext = createContext<IAudioContextContext | undefined>(
  undefined,
);

export const AudioContextProvider = ({ children }: { children: ReactNode }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    const context = new window.AudioContext();
    setAudioContext(context);

    return () => {
      context.close();
    };
  }, []);

  return (
    <AudioContextContext.Provider value={{ audioContext }}>
      {children}
    </AudioContextContext.Provider>
  );
};

export const useAudioContext = (): IAudioContextContext => {
  const context = useContext(AudioContextContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};
