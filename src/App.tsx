import "./App.css";
import { useState } from "react";
import { Color } from "three";
import { Canvas } from "@react-three/fiber";
import CameraPermissions from "./camera-permission";
import ColorSwitcher from "./components/ColorSwitcher";
import FaceTracking from "./FaceTracking";
import Avatar from "./Avatar";

function App() {
  const [url, setUrl] = useState<string>(
    "https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024"
  );

  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [readyForTracking, setReadyForTracking] = useState(false);

  const handleStreamReady = (vid: HTMLVideoElement) => {
    console.log("Video stream ready:", vid);
    setVideoEl(vid);
  };

  return (
    <div className="App">
      {/* Step 1 + 2 Camera permissions / preview */}
      <CameraPermissions
        onStreamReady={handleStreamReady}
        onContinue={() => setReadyForTracking(true)}
      />

      {/* Start FaceTracking only after continue */}
      {readyForTracking && videoEl && <FaceTracking videoElement={videoEl} />}

      <Canvas
        className="avatar-container bottom-0 pos-abs z-1"
        camera={{ fov: 25 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <pointLight
          position={[10, 10, 10]}
          color={new Color(1, 1, 0)}
          intensity={0.5}
          castShadow
        />
        <pointLight
          position={[-10, 0, 10]}
          color={new Color(1, 0, 0)}
          intensity={0.5}
          castShadow
        />
        <pointLight position={[0, 0, 10]} intensity={0.5} castShadow />
        <Avatar url={url} />
      </Canvas>

      <ColorSwitcher />
    </div>
  );
}

export default App;
