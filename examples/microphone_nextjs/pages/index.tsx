import { GetServerSideProps } from "next";
import React, {
  useState,
  useMemo,
  useRef,
  CSSProperties,
  useEffect,
} from "react";
import { RealtimeSession, RealtimeRecognitionResult } from "speechmatics";
import { AudioRecorder, useAudioDevices } from "../utils/recorder";
import { getJwt } from '../utils/auth';

type MainProps = { jwt?: string };

type SessionState = "configure" | "starting" | "blocked" | "error" | "running";

export default function Main({ jwt }: MainProps) {
  const [transcription, setTranscription] = useState<
    RealtimeRecognitionResult[]
  >([]);
  const [audioDeviceId, setAudioDeviceId] = useState<string>("");
  const [sessionState, setSessionState] = useState<SessionState>("configure");

  const rtSessionRef = useRef(new RealtimeSession(jwt));

  // Get devices using our custom hook
  const [requestDevices, setRequestDevices] = useState<boolean>(false);
  const [devices, denied] = useAudioDevices(requestDevices);

  // useEffect listens for changes in devices
  // It sets a default deviceId if no valid deviceId is already set
  useEffect(() => {
    if (
      devices.length &&
      !devices.some((item) => item.deviceId === audioDeviceId)
    )
      setAudioDeviceId(devices[0].deviceId);
    if (denied) setSessionState("blocked");
  }, [devices, denied]);

  // sendAudio is used as a wrapper for the websocket to check the socket is finished init-ing before sending data
  const sendAudio = (data: Blob) => {
    if (
      rtSessionRef.current.rtSocketHandler &&
      rtSessionRef.current.isConnected
    ) {
      rtSessionRef.current.sendAudio(data);
    }
  };

  // Memoise AudioRecorder so it doesn't get recreated on re-render
  const audioRecorder = useMemo(() => new AudioRecorder(sendAudio), []);

  // Attach our event listeners to the realtime session
  rtSessionRef.current.addListener("AddTranscript", (res) => {
    setTranscription([...transcription, ...res.results]);
  });

  // start audio recording once the websocket is connected
  rtSessionRef.current.addListener("RecognitionStarted", async () => {
    setSessionState("running");
  });

  rtSessionRef.current.addListener("EndOfTranscript", async () => {
    setSessionState("configure");
    await audioRecorder.stopRecording();
  });

  rtSessionRef.current.addListener("Error", async () => {
    setSessionState("error");
    await audioRecorder.stopRecording();
  });

  // Call the start method on click to start the websocket
  const startTranscription = async () => {
    setSessionState("starting");
    await audioRecorder.startRecording(audioDeviceId)
    .then(async () => {
      setTranscription([]);
      await rtSessionRef.current.start({
        transcription_config: { max_delay: 2, language: "en" },
        audio_format: {
          type: "file",
        },
      });

    }).catch(err => setSessionState("blocked"))
  };

  // Stop the transcription on click to end the recording
  const stopTranscription = async () => {
    await audioRecorder.stopRecording();
    await rtSessionRef.current.stop();
  };

  return (
    <div>
      <div className="flex-row">
        <p>Select Microphone</p>
        {sessionState === "blocked" && (
          <p className="warning-text">Microphone permission is blocked</p>
        )}
      </div>
      <MicSelect
        onClick={() => {
          setRequestDevices(true);
        }}
        value={audioDeviceId}
        options={devices.map((item) => {
          return { value: item.deviceId, label: item.label };
        })}
        onChange={(e) => setAudioDeviceId(e.target.value)}
      />
      <TranscriptionButton
        sessionState={sessionState}
        stopTranscription={stopTranscription}
        startTranscription={startTranscription}
      />
      {sessionState === "error" && (
        <p className="warning-text">Session encountered an error</p>
      )}
      {["starting", "running", "configure", "blocked"].includes(
        sessionState
      ) && <p>State: {sessionState}</p>}
      <p>
        {transcription.map(
          (item, index) =>
            (index && ![".", ","].includes(item.alternatives[0].content)
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
  const jwt = await getJwt();
  if (jwt === undefined) throw new Error("JWT undefined");
  return {
    props: { jwt },
  };
};

// ButtonInfoBar - component for stopping/starting session

type TranscriptionButtonProps = {
  startTranscription: () => void;
  stopTranscription: () => void;
  sessionState: SessionState;
};

function TranscriptionButton({
  startTranscription,
  stopTranscription,
  sessionState,
}: TranscriptionButtonProps) {
  return (
    <div className="bottom-button-status">
      {["configure", "stopped", "starting", "error", "blocked"].includes(
        sessionState
      ) && (
        <button
          type="button"
          className="bottom-button start-button"
          disabled={["starting", "blocked"].includes(sessionState)}
          onClick={async () => {
            startTranscription();
          }}
        >
          <CircleIcon style={{ marginRight: "0.25em", marginTop: "1px" }} />
          Start Transcribing
        </button>
      )}

      {sessionState === "running" && (
        <button
          type="button"
          className="bottom-button stop-button"
          onClick={() => stopTranscription()}
        >
          <SquareIcon style={{ marginRight: "0.25em", marginBottom: "1px" }} />
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
        <title>A Circle Icon</title>
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
        <title>A Square Icon</title>
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
  onClick: () => void;
  options: Option[];
}

const MicSelect: React.FunctionComponent<MicSelectProps> = ({
  onChange,
  onClick,
  options,
  value,
}) => {
  return (
    <select
      onClick={onClick}
      onKeyDown={onClick}
      value={value}
      onChange={onChange}
    >
      <option value="" disabled selected hidden>Default Audio Input</option>
      {Object.entries(options).map(([key, value]) => (
        <option value={key} key={key}>
          {value.label}
        </option>
      ))}
    </select>
  );
};
