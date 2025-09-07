// App.tsx
import "./App.css";
import { useState, useRef } from "react";
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

  const [isRecording, setIsRecording] = useState(false);
  const recordedFrames = useRef<any[]>([]);

  const handleStreamReady = (vid: HTMLVideoElement) => {
    console.log("Video stream ready:", vid);
  };

  // Called every frame from FaceTracking.tsx
  const handleFrame = (frameData: any) => {
    if (isRecording) {
      recordedFrames.current.push(frameData);
    }
  };

  const startRecording = () => {
    recordedFrames.current = []; // reset buffer only at start
    setIsRecording(true);
    console.log("🎬 Recording started...");
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log("⏹ Recording stopped. Frames:", recordedFrames.current.length);

    if (!recordedFrames.current.length) {
      alert("No frames captured — try recording longer!");
      return;
    }

    const data = recordedFrames.current;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `face_motion_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      {/* Camera setup */}
      <CameraPermissions onStreamReady={handleStreamReady} />

      {/* Face tracking loop */}
      <FaceTracking onStreamReady={handleStreamReady} onFrame={handleFrame} />

      {/* Recording Controls */}
      <div className="controls pos-abs top-0 right-0 m-4 flex gap-2">
        {!isRecording ? (
          <button className="button primary" onClick={startRecording}>
            🎬 Start Recording
          </button>
        ) : (
          <button className="button danger" onClick={stopRecording}>
            ⏹ Stop & Save
          </button>
        )}
      </div>

      {/* Avatar rendering */}
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
