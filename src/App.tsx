// src/App.tsx
import "./App.css";
import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import CameraPermissions from "./camera-permission";
import ColorSwitcher from "./components/ColorSwitcher";
import FaceTracking from "./FaceTracking";
import Avatar from "./Avatar";
import Loader from "./Loader";
import { startRecording, stopRecording, isRecording } from './animationRecorder';
import { exportAnimation } from './exportAnimation';

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
      <div className="controls">
        <button
          onClick={() => {
            if (!videoStream) return alert("Camera not ready yet!");
            startRecording();
            console.log("Recording started");
          }}
        >
          Start Recording
        </button>
        <button
          onClick={() => {
            stopRecording();
            console.log("Recording stopped");
          }}
        >
          Stop Recording
        </button>
        <button
          onClick={async () => {
            if (!avatarReady) return alert("Avatar not ready yet!");
            await exportAnimation(url);
          }}
        >
          Save Animation
        </button>
      </div>
      <CameraPermissions onStreamReady={handleStreamReady} />
      {avatarReady && videoStream && <FaceTracking videoStream={videoStream} />}
      <Canvas
        className="avatar-container bottom-0 pos-abs z-1"
        camera={{ fov: 27, position: [0, 0, 4.2] }}
        dpr={[1, window.devicePixelRatio]}
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
      <ColorSwitcher />
      <p>{isRecording ? "Recording..." : "Idle"}</p>
    </div>
  );
}

export default App;
