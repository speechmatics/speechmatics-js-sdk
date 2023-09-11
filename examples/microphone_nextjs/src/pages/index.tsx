import { GetServerSideProps } from "next";
import React, {
  useState,
  useMemo,
  useRef,
  CSSProperties,
  useEffect,
} from "react";
import { RealtimeSession, RealtimeRecognitionResult } from "speechmatics";
import { AudioRecorder, useAudioDevices } from "../utils/audio-capture";

type MainProps = { jwt?: string; simplUI?: boolean };

export default function Main({ jwt }: MainProps) {
  const [transcription, setTranscription] = useState<
    RealtimeRecognitionResult[]
  >([]);
  const [audioDeviceId, setAudioDeviceId] = useState<string>("");
  const [sessionState, setSessionState] = useState<boolean>(false);

  const rtSessionRef = useRef(new RealtimeSession(jwt));

  // Get devices using our custom hook
  const [devices, denied] = useAudioDevices(true);

  // useEffect listens for changes in devices
  // It sets a default deviceId if no valid deviceId is already set
  useEffect(() => {
    if (
      devices.length &&
      !devices.some((item) => item.deviceId == audioDeviceId)
    )
      setAudioDeviceId(devices[0].deviceId);
  }, [devices]);

  // sendAudio is used as a wrapper for the websocket to check the socket is finished init-ing before sending data
  const sendAudio = (data: Float32Array | Buffer) => {
    if (
      rtSessionRef.current.rtSocketHandler &&
      rtSessionRef.current.isConnected
    ) {
      rtSessionRef.current.sendAudio(data);
    }
  };

  // Memoise AudioRecorder so it doesn't get recreated on re-render
  const audioRecorder = useMemo(
    () => new AudioRecorder(sendAudio),
    []
  );

  // Attach our event listeners to the realtime session
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

  // Call the start method on click to start the websocket and audio recording
  const startTranscription = async () => {
    setTranscription([]);
    await rtSessionRef.current.start({
      transcription_config: { max_delay: 2, language: "en" },
      audio_format: {
        type: "file",
      },
    });
    await audioRecorder.startRecording(audioDeviceId);
  };

  // Stop the transcription on click to end the recording
  const stopTranscription = async () => {
    await audioRecorder.stopRecording();
    await rtSessionRef.current.stop();
  };

  return (
    <div>
      <p>Select Microphone</p>
      <MicSelect
        value={audioDeviceId}
        options={devices.map((item) => {
          return { value: item.deviceId, label: item.label };
        })}
        onChange={(e) => setAudioDeviceId(e.target.value)}
      />
      <ButtonInfoBar
        sessionState={sessionState}
        stopTranscription={stopTranscription}
        startTranscription={startTranscription}
      />
      <p>
        {transcription.map(
          (item, index) =>
            (index != 0 && ![".", ","].includes(item.alternatives[0].content)
              ? " "
              : "") + item.alternatives[0].content
        )}
      </p>
    </div>
  );
}

// getServerSideProps - used to perform server side preparation
// In this case, the long-lived API key is provided to the server and used to fetch a short-lived JWT
// The short-lived JWT is then given to the client to connect to Speechmatics' service
// This ensures the security of long-lived tokens and reduces the scope for abuse from end users
export const getServerSideProps: GetServerSideProps = async (context) => {

  // Instantiate an RT session to get the default URLs. Should really be available in their own right
  // This is a limitation of the SDK interface and will be fixed at some point
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

  if (jwt === undefined) throw new Error("JWT undefined");

  return {
    props: { jwt },
  };
};

// ButtonInfoBar - component for stopping/starting session

type ButtonInfoBarProps = {
  startTranscription: () => void;
  stopTranscription: () => void;
  sessionState: boolean;
};

function ButtonInfoBar({
  startTranscription,
  stopTranscription,
  sessionState,
}: ButtonInfoBarProps) {
  return (
      <div className="bottom-button-status">
        {!sessionState && (
          <button
            className="bottom-button start-button"
            onClick={async () => {
              startTranscription();
            }}
          >
            <CircleIcon style={{ marginRight: "0.25em", marginTop: "1px" }} />
            Start Transcribing
          </button>
        )}

        {sessionState && (
          <button
            className="bottom-button stop-button"
            onClick={() => stopTranscription()}
          >
            <SquareIcon
              style={{ marginRight: "0.25em", marginBottom: "1px" }}
            />
            Stop Transcribing
          </button>
        )}
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

// MicSelect - component with a select menu for choosing mic inputs

type Option = {
  value: string;
  label: string;
};

interface MicSelectProps {
  value: string;
  onChange: (event) => void;
  options: Option[];
}

const MicSelect: React.FunctionComponent<MicSelectProps> = ({
  onChange,
  options,
  value,
}) => {
  return (
    <select value={value} onChange={onChange}>
      {Object.entries(options).map(([key, value], i) => (
        <option value={key} key={i}>
          {value.label}
        </option>
      ))}
    </select>
  );
};