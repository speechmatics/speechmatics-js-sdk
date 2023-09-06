import { GetServerSideProps } from "next";
import { useState, useMemo, useRef, CSSProperties } from "react";
import { RealtimeSession, RealtimeRecognitionResult } from "speechmatics";
import { AudioRecorder } from "../utils/audio-capture";

type DemoProps = { jwt?: string; simplUI?: boolean };

export default function Demo({ jwt }: DemoProps) {
  const [transcription, setTranscription] = useState<
    RealtimeRecognitionResult[]
  >([]);

  const [sessionState, setSessionState] = useState<boolean>(false);

  const rtSessionRef = useRef(new RealtimeSession(jwt));

  const sendAudio = (data: Float32Array | Buffer) => {
    if (rtSessionRef.current.rtSocketHandler && rtSessionRef.current.isConnected) {
      rtSessionRef.current.sendAudio(data);
    }
  };

  const audioRecorder = useMemo(
    () =>
      new AudioRecorder(
        sendAudio,
        (err: any, opena: boolean, denied: boolean) => {},
        () => {},
        () => {}
      ),
    [rtSessionRef.current.rtSocketHandler]
  );

  rtSessionRef.current.addListener("AddTranscript", (res) => {
    setTranscription([...transcription, ...res.results]);
  });
  rtSessionRef.current.addListener("RecognitionStarted", () => {
    setSessionState(true);
  });
  rtSessionRef.current.addListener("EndOfTranscript", () => {
    setSessionState(false);
    audioRecorder.stopRecording();
  });

  const startTranscription = async () => {
    setTranscription([]);
    await rtSessionRef.current.start({
      transcription_config: { max_delay: 2, language: "en" },
      audio_format: {
        type: "raw",
        encoding: "pcm_f32le",
        sample_rate: 44000,
      },
    });
    await audioRecorder.startRecording();
  };

  const stopTranscription = async () => {
    await audioRecorder.stopRecording();
    await rtSessionRef.current.stop();
  };

  return (
    <div className="widget-frame">
      <ButtonInfoBar
        sessionState={sessionState}
        stopTranscription={stopTranscription}
        startTranscription={startTranscription}
      />
      <p>
        {transcription.map((item, index) =>
          (index != 0 && !['.', ','].includes(item.alternatives[0].content) ? ' ' : '') + item.alternatives[0].content
        )}
      </p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const rtSession = new RealtimeSession("");

  const jwt = await fetch(
    `${rtSession.connectionConfig.managementPlatformUrl}/api_keys?type=rt`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_API_KEY}`,
      },
      body: JSON.stringify({ ttl: 3600 }),
    }
  )
    .then((res) => res.json())
    .then((data) => data.key_value);

  console.log(jwt);

  if (jwt === undefined) throw new Error("JWT undefined");

  return {
    props: { jwt },
  };
};

type CompProps = {
  startTranscription: () => void,
  stopTranscription: () => void,
  sessionState: boolean,
};

function ButtonInfoBar({ startTranscription, stopTranscription, sessionState }: CompProps) {

  return (
    <div className="bottom-bar">
      <div className="bottom-button-status">
        {!sessionState && (
          <button
            className="bottom-button start-button"
            onClick={async () => {
              startTranscription();
            }}
          >
            <CircleIcon style={{ marginRight: '0.25em', marginTop: '1px' }} />
            Start Transcribing
          </button>
        )}

        {sessionState &&
          <button
            className="bottom-button stop-button"
            onClick={() => stopTranscription()}>
            <SquareIcon style={{ marginRight: '0.25em', marginBottom: '1px' }} />
            Stop Transcribing
          </button>
        }

        {false &&
          <div className="bottom-button retry-button" style={{ cursor: 'default' }}>Warning</div>}
      </div>
    </div>
  );
}

function CircleIcon(props: React.SVGProps<SVGSVGElement> & CSSProperties) {
  return (
    <span style={{ ...props.style }}>
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <circle cx={6} cy={6} r={4} fill="#C84031" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6 12A6 6 0 106 0a6 6 0 000 12zm0-.857A5.143 5.143 0 106 .857a5.143 5.143 0 000 10.286z"
          fill="#C84031"
        />
      </svg>
    </span>
  );
}

function SquareIcon(props: React.SVGProps<SVGSVGElement> & CSSProperties) {
  return (
    <span style={{ ...props.style }}>
      <svg
        width={6}
        height={6}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path fill="#fff" d="M0 0h6v6H0z" />
      </svg>
    </span>
  );
}