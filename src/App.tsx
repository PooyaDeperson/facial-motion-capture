import { Suspense, useState } from "react";
import Loader from "./Loader";
import "./App.css";
import { Color } from "three";
import { Canvas } from "@react-three/fiber";
import CameraPermissions from "./camera-permission"; // ✅ make sure the path is correct
import ColorSwitcher from "./components/ColorSwitcher"; // ✅ path must match
import FaceTracking from "./FaceTracking"; // ✅ path must match
import Avatar from "./Avatar"; // ✅ path must match

function App() {
  const [url, setUrl] = useState<string>(
    "https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024"
  );
  const [avatarReady, setAvatarReady] = useState(false);

  const handleStreamReady = (vid: HTMLVideoElement) => {
    console.log("Video stream ready:", vid);
  };

  return (
    <div className="App">
      <CameraPermissions onStreamReady={handleStreamReady} />

      {/* Load FaceTracking only when avatar is ready ✅ */}
      {avatarReady && <FaceTracking onStreamReady={handleStreamReady} />}

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

      <ColorSwitcher />
    </div>
  );
}
export default App;
