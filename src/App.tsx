import "./App.css";
import { useState } from "react";
import { Color } from "three";
import { Canvas } from "@react-three/fiber";
import CameraPermissions from "./camera-permission";
import ColorSwitcher from "./components/ColorSwitcher";
import FaceTracking from "./FaceTracking";
import Avatar from "./Avatar";

function App() {
  // --- URL of the avatar model (unchanged) ---
  const [url, setUrl] = useState<string>(
    "https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024"
  );

  // --- New: Store the current video stream from the camera ---
  const [stream, setStream] = useState<MediaStream | null>(null);

  // --- Handler when video stream is ready ---
  const handleStreamReady = (vid: HTMLVideoElement) => {
    // Grab the MediaStream from the video element
    const videoStream = vid.srcObject as MediaStream;
    setStream(videoStream); // Store in state so FaceTracking re-initializes when camera changes
  };

  return (
    <div className="App">
      {/* --- CameraPermissions now updates stream on camera change --- */}
      <CameraPermissions onStreamReady={handleStreamReady} />

      {/* --- FaceTracking now takes videoStream as a prop --- */}
      <FaceTracking videoStream={stream} onStreamReady={handleStreamReady} />

      {/* --- Canvas setup for the 3D avatar (unchanged) --- */}
      <Canvas
        className="avatar-container bottom-0 pos-abs z-1"
        style={{}} // ← this resets all Fiber’s inline styles
        camera={{ fov: 25 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color={new Color(1, 1, 0)} intensity={0.5} castShadow />
        <pointLight position={[-10, 0, 10]} color={new Color(1, 0, 0)} intensity={0.5} castShadow />
        <pointLight position={[0, 0, 10]} intensity={0.5} castShadow />
        <Avatar url={url} />
      </Canvas>

      <ColorSwitcher />
    </div>
  );
}

export default App;
