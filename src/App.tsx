import "./App.css";
import { useState } from "react";
import { Color } from "three";
import { Canvas } from "@react-three/fiber";
import { useDropzone } from "react-dropzone";
import CameraPermissions from "./camera-permission";
import ColorSwitcher from "./components/ColorSwitcher";
import FaceTracking from "./FaceTracking";
import Avatar from "./Avatar";

function App() {
  const [url, setUrl] = useState<string>(
    "https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024"
  );

  // const { getRootProps } = useDropzone({
  //   onDrop: (files) => {
  //     const file = files[0];
  //     const reader = new FileReader();
  //     reader.onload = () => setUrl(reader.result as string);
  //     reader.readAsDataURL(file);
  //   },
  // });

  const handleStreamReady = (vid: HTMLVideoElement) => {
    console.log("Video stream ready:", vid);
  };

  return (
    <div className="App">
      <CameraPermissions onStreamReady={handleStreamReady} />

      {/* <div {...getRootProps({ className: "dropzone" })}>
        <p>Drag & drop RPM avatar GLB file here</p>
      </div> */}

      {/* <input
        className="url"
        type="text"
        placeholder="Paste RPM avatar URL"
        onChange={(e) =>
          setUrl(`${e.target.value}?morphTargets=ARKit&textureAtlas=1024`)
        }
      /> */}

      {/* Mediapipe now lives inside FaceTracking */}
      <FaceTracking onStreamReady={handleStreamReady} />

      <Canvas
        className="avatar-container bottom-0 pos-abs z-1"
        style={{}}   // ← this resets all Fiber’s inline styles
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

      {/* <img className="logo" src="./logo.png" /> */}
      <ColorSwitcher />
    </div>
  );
}

export default App;
