import './App.css';
import { useEffect, useState } from 'react';
import { FaceLandmarker, FaceLandmarkerOptions, FilesetResolver } from "@mediapipe/tasks-vision";
import { Color, Euler, Matrix4 } from 'three';
import { Canvas, useFrame, useGraph } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useDropzone } from 'react-dropzone';
import CameraPermissions from './CameraPermissions';

// ... (global variables stay the same)

function App() {
  const [url, setUrl] = useState<string>("https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024");

  // Dropzone handler for loading custom GLB avatars
  const { getRootProps } = useDropzone({
    onDrop: files => {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => setUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  });

  // Mediapipe setup
  const setup = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, options);
  };

  // Face prediction loop
  const predict = async () => {
    let nowInMs = Date.now();
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      const result = faceLandmarker.detectForVideo(video, nowInMs);
      if (result.faceBlendshapes?.length && result.faceBlendshapes[0].categories) {
        blendshapes = result.faceBlendshapes[0].categories;
        const matrix = new Matrix4().fromArray(result.facialTransformationMatrixes![0].data);
        rotation = new Euler().setFromRotationMatrix(matrix);
      }
    }
    window.requestAnimationFrame(predict);
  };

  const handleStreamReady = (vid: HTMLVideoElement) => {
    video = vid;
    video.addEventListener("loadeddata", predict);
  };

  useEffect(() => { setup(); }, []);

  return (
    <div className="App">
      <CameraPermissions onStreamReady={handleStreamReady} />
      <div {...getRootProps({ className: 'dropzone' })}>
        <p>Drag & drop RPM avatar GLB file here</p>
      </div>
      <input className='url' type="text" placeholder="Paste RPM avatar URL" onChange={(e) => setUrl(`${e.target.value}?morphTargets=ARKit&textureAtlas=1024`)} />
      <video className='camera-feed' id="video" autoPlay playsInline></video>
      <Canvas style={{ height: 600 }} camera={{ fov: 25 }} shadows>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color={new Color(1, 1, 0)} intensity={0.5} castShadow />
        <pointLight position={[-10, 0, 10]} color={new Color(1, 0, 0)} intensity={0.5} castShadow />
        <pointLight position={[0, 0, 10]} intensity={0.5} castShadow />
        <Avatar url={url} />
      </Canvas>
      <img className='logo' src="./logo.png" />
    </div>
  );
}

export default App;
