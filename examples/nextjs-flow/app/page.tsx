export default function Home() {
  return (
    <div className="flex flex-col gap-5 h-screen justify-center items-center">
      <h1>Speechmatics Flow NextJS examples</h1>
      <p>How would you like to connect?</p>
      <nav className="grid grid-cols-2 gap-4">
        <a href="/websocket" className="btn">
          Websocket
        </a>
        <a href="/livekit" className="btn">
          Livekit
        </a>
      </nav>
    </div>
  );
}
