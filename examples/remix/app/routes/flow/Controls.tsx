import { useCallback, useState } from 'react';
import { useFlow, useFlowEventListener } from '@speechmatics/flow-client-react';
import {
  usePcmAudioListener,
  usePcmAudioRecorder,
} from '@speechmatics/browser-audio-input-react';
import { useLoaderData } from '@remix-run/react';
import { useSpeechmaticsJWT } from '~/hooks/use-speechmatics-jwt';
import { MicrophoneSelect } from '~/components/MicrophoneSelect';
import { usePlayPcm16Audio } from '~/hooks/use-play-pcm-audio';

const SAMPLE_RATE = 16_000;

export function Controls() {
  const { socketState, sendAudio, startConversation, endConversation } =
    useFlow();
  const connected = socketState === 'open';

  const { personas } = useLoaderData<typeof import('./route').loader>();
  const [personaId, setPersonaId] = useState(Object.keys(personas)[0]);

  const [deviceId, setDeviceId] = useState<string>();

  const [loading, setLoading] = useState(false);

  const [audioContext, setAudioContext] = useState<AudioContext>();

  const { startRecording, stopRecording, mediaStream, isRecording } =
    usePcmAudioRecorder();

  // Stream microphone audio to API for recognition
  usePcmAudioListener((audio) => {
    sendAudio(audio);
  });

  // Play audio coming back from agent
  const playAudio = usePlayPcm16Audio(audioContext);
  useFlowEventListener('agentAudio', ({ data }) => {
    playAudio(data);
  });

  const getJWT = useSpeechmaticsJWT('flow');

  const startSession = async () => {
    try {
      console.log('starting');
      setLoading(true);

      const jwt = await getJWT();

      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      setAudioContext(audioContext);

      await startConversation(jwt, {
        config: {
          template_id: personaId,
          template_variables: {},
        },
        audioFormat: {
          type: 'raw',
          encoding: 'pcm_f32le',
          sample_rate: SAMPLE_RATE,
        },
      });

      await startRecording({ audioContext, deviceId });
    } finally {
      setLoading(false);
    }
  };

  const stopSession = useCallback(async () => {
    endConversation();
    stopRecording();
    await audioContext?.close();
  }, [endConversation, stopRecording, audioContext]);

  return (
    <article>
      <div className="grid">
        <MicrophoneSelect setDeviceId={setDeviceId} />
        <label>
          Select persona
          <select
            onChange={(e) => {
              setPersonaId(e.target.value);
            }}
          >
            {Object.entries(personas).map(([id, { name }]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid">
        <button
          type="button"
          onClick={connected ? stopSession : startSession}
          className={connected ? 'secondary' : undefined}
          aria-busy={loading}
        >
          {connected ? 'Stop conversation' : 'Start conversation'}
        </button>
      </div>
    </article>
  );
}
