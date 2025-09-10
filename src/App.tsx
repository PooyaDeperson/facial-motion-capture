import AvatarSwitcher from "./components/AvatarSwitcher";

function App() {
  const [url, setUrl] = useState<string>(
    "https://models.readyplayer.me/68c19bef8ac0d37a66aa2930.glb?morphTargets=ARKit&textureAtlas=1024"
  );
  const [avatarReady, setAvatarReady] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const handleStreamReady = (stream: MediaStream) => {
    setVideoStream(stream);
  };

  return (
    <div className="App">
      <CameraPermissions onStreamReady={handleStreamReady} />

      {avatarReady && videoStream && <FaceTracking videoStream={videoStream} />}

      <Canvas
        className="avatar-container bottom-0 pos-abs z-1"
        camera={{ fov: 25 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} castShadow />
        <pointLight position={[-10, 0, 10]} intensity={0.5} castShadow />
        <pointLight position={[0, 0, 10]} intensity={0.5} castShadow />

        <Suspense fallback={<Loader />}>
          <Avatar url={url} onLoaded={() => setAvatarReady(true)} />
        </Suspense>
      </Canvas>

      {/* Avatar switcher */}
      <AvatarSwitcher selectedUrl={url} onSelect={(newUrl) => {
        setAvatarReady(false); // reset loading state
        setUrl(newUrl);
      }} />

      <ColorSwitcher />
    </div>
  );
}
