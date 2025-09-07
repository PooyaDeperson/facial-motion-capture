import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Avatar, { AvatarRef } from "./Avatar";
import FaceTracking, { blendshapes } from "./FaceTracking";
import { exportBlendshapeRecording } from "./exportGLB";
import { exportAvatarAnimation } from "./exportAvatarAnimation";

function App() {
  const avatarRef = useRef<AvatarRef>(null);
  const [frames, setFrames] = useState<any[]>([]);
  const [url, setUrl] = useState<string>(
    "https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024"
  );

  const handleFrame = (frameData: any) => {
    setFrames(prev => [...prev, frameData]);
  };

  return (
    <div>
      <FaceTracking onStreamReady={() => {}} onFrame={handleFrame} />
      <Canvas style={{ width: 600, height: 600 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[1, 2, 3]} intensity={0.7} />
        <Avatar ref={avatarRef} url={url} />
      </Canvas>
      <button onClick={() => exportBlendshapeRecording(frames)}>Export Blendshapes</button>
      <button onClick={() => avatarRef.current && exportAvatarAnimation(avatarRef.current.headMesh, avatarRef.current.nodes, frames)}>
        Export Avatar Animation
      </button>
    </div>
  );
}

export default App;
