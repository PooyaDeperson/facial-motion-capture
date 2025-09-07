import "./App.css";
import { useState, useRef } from "react";
import { Color } from "three";
import { Canvas } from "@react-three/fiber";
import CameraPermissions from "./camera-permission";
import ColorSwitcher from "./components/ColorSwitcher";
import FaceTracking from "./FaceTracking";
import Avatar from "./Avatar";
import { exportAvatarAnimation } from "./exportAvatarAnimation";

function App() {
  const [url] = useState("https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024");
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const recordedFrames = useRef<any[]>([]);
  const avatarRef = useRef<any>(null);

  const handleStreamReady = (vid: HTMLVideoElement) => console.log("Video ready:", vid);
  const handleFrame = (frameData: any) => { if (isRecordingRef.current) recordedFrames.current.push(frameData); }

  const startRecording = () => { recordedFrames.current=[]; isRecordingRef.current=true; setIsRecording(true); console.log("Recording started"); }
  const stopRecording = () => {
    isRecordingRef.current=false; setIsRecording(false);
    if (!recordedFrames.current.length) return alert("No frames captured");
    if (!avatarRef.current?.headMesh || !avatarRef.current?.nodes) return alert("Avatar not loaded");
    exportAvatarAnimation(avatarRef.current.headMesh, avatarRef.current.nodes, recordedFrames.current, `avatarRecording_${Date.now()}.glb`);
    recordedFrames.current=[];
  }

  return (
    <div className="App">
      <CameraPermissions onStreamReady={handleStreamReady} />
      <FaceTracking onStreamReady={handleStreamReady} onFrame={handleFrame} />
      <div className="controls pos-abs top-0 right-0 m-4 flex gap-2">
        {!isRecording ? <button className="button primary" onClick={startRecording}>🎬 Start Recording</button>
                      : <button className="button danger" onClick={stopRecording}>⏹ Stop & Save</button>}
      </div>
      <Canvas className="avatar-container bottom-0 pos-abs z-1" camera={{fov:25}} shadows>
        <ambientLight intensity={0.5}/>
        <pointLight position={[10,10,10]} color={new Color(1,1,0)} intensity={0.5} castShadow/>
        <pointLight position={[-10,0,10]} color={new Color(1,0,0)} intensity={0.5} castShadow/>
        <pointLight position={[0,0,10]} intensity={0.5} castShadow/>
        <Avatar ref={avatarRef} url={url}/>
      </Canvas>
      <ColorSwitcher/>
    </div>
  );
}

export default App;
