import "./App.css";
import { useState, useRef } from "react";
import { Color } from "three";
import { Canvas } from "@react-three/fiber";
import { useDropzone } from "react-dropzone";
import CameraPermissions from "./camera-permission";
import ColorSwitcher from "./components/ColorSwitcher";
import FaceTracking, { blendshapes } from "./FaceTracking";
import Avatar, { AvatarRef } from "./Avatar";
import { exportBlendshapeRecording } from "./exportGLB";
import { exportAvatarAnimation } from "./exportAvatarAnimation";

function App() {
  const [url, setUrl] = useState<string>(
    "https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024"
  );

  const [frames, setFrames] = useState<any[]>([]);
  const avatarRef = useRef<AvatarRef>(null);

  // Optional: Dropzone for local GLB uploads
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "model/gltf-binary": [".glb"] },
    onDrop: (files) => {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => setUrl(reader.result as string);
      reader.readAsDataURL(file);
    },
  });

  const handleStreamReady = (vid: HTMLVideoElement) => {
    console.log("Video stream ready:", vid);
  };

  const handleFrame = (frameData: any) => {
    setFrames((prev) => [...prev, frameData]);
  };

  return (
    <div className="App">
      <CameraPermissions onStreamReady={handleStreamReady} />

      {/* Optional: Dropzone for local GLB uploads */}
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag & drop RPM avatar GLB file here</p>
      </div>

      {/* Optional: Paste URL */}
      <input
        className="url"
        type="text"
        placeholder="Paste RPM avatar URL"
        value={url.replace(/\?morphTargets=ARKit&textureAtlas=1024$/, "")}
        onChange={(e) =>
          setUrl(`${e.target.value}?morphTargets=ARKit&textureAtlas=1024`)
        }
      />

      {/* Face tracking */}
      <FaceTracking onStreamReady={handleStreamReady} onFrame={handleFrame} />

      {/* 3D Canvas */}
      <Canvas
        className="avatar-container bottom-0 pos-abs z-1"
        camera={{ fov: 25, position: [0, 0, 5] }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color={new Color(1, 1, 0)} intensity={0.5} castShadow />
        <pointLight position={[-10, 0, 10]} color={new Color(1, 0, 0)} intensity={0.5} castShadow />
        <pointLight position={[0, 0, 10]} intensity={0.5} castShadow />
        <Avatar ref={avatarRef} url={url} />
      </Canvas>

      {/* Export buttons */}
      <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", gap: "10px" }}>
        <button onClick={() => exportBlendshapeRecording(frames)}>Export Blendshapes</button>
        <button
          onClick={() =>
            avatarRef.current &&
            exportAvatarAnimation(avatarRef.current.headMesh, avatarRef.current.nodes, frames)
          }
        >
          Export Avatar Animation
        </button>
      </div>

      <ColorSwitcher />
    </div>
  );
}

export default App;
