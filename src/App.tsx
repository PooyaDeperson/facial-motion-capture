import "./App.css";
import { useState, Suspense } from "react";
import { Color } from "three";
import { Canvas } from "@react-three/fiber";
import CameraPermissions from "./camera-permission";
import ColorSwitcher from "./components/ColorSwitcher";
import FaceTracking from "./FaceTracking";
import Avatar from "./Avatar";
import Loader from "./Loader";

function App() {
  const [url, setUrl] = useState<string>(
    "https://models.readyplayer.me/68c19bef8ac0d37a66aa2930.glb?morphTargets=ARKit&textureAtlas=1024"
  );

  const [avatarReady, setAvatarReady] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // Called when CameraPermissions provides a stream
  const handleStreamReady = (stream: MediaStream) => {
    setVideoStream(stream);
  };

  return (
    <div className="App">
      {/* Camera permissions & stream setup */}
      <CameraPermissions onStreamReady={handleStreamReady} />

      {/* Face tracking only starts when avatar and camera are ready */}
      {avatarReady && videoStream && <FaceTracking videoStream={videoStream} />}

      {/* 3D Avatar canvas */}
      <Canvas
        className="avatar-container bottom-0 pos-abs z-1"
        camera={{ fov: 27,
          position: [0, 0, 0] 
        }} // ~50mm equivalent and moved closer
        shadows
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} castShadow />
        <pointLight position={[-10, 0, 10]} intensity={0.5} castShadow />
        <pointLight position={[0, 0, 10]} intensity={0.5} castShadow />

        {/* Suspense shows loader until avatar is fully loaded */}
        <Suspense fallback={<Loader />}>
          <Avatar url={url} onLoaded={() => setAvatarReady(true)} />
        </Suspense>
      </Canvas>

      {/* UI components */}
      <ColorSwitcher />
    </div>
  );
}

export default App;
