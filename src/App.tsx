import './App.css';
import { useEffect, useState } from 'react';
import { FaceLandmarker, FaceLandmarkerOptions, FilesetResolver } from "@mediapipe/tasks-vision";
import { Color, Euler, Matrix4 } from 'three';
import { Canvas, useFrame, useGraph } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useDropzone } from 'react-dropzone';
import CameraPermissions from './camera-permission';

// Global variables for face tracking
let video: HTMLVideoElement;
let faceLandmarker: FaceLandmarker;
let lastVideoTime = -1;
let blendshapes: any[] = [];
let rotation: Euler;
let headMesh: any[] = [];

// Mediapipe FaceLandmarker options
const options: FaceLandmarkerOptions = {
  baseOptions: {
    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
    delegate: "GPU"
  },
  numFaces: 1,
  runningMode: "VIDEO",
  outputFaceBlendshapes: true,
  outputFacialTransformationMatrixes: true,
};

// Avatar component: loads GLB and applies blendshapes
function Avatar({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const { scene } = useGLTF(url);
  const { nodes } = useGraph(scene);

  // Notify parent when GLB is loaded
  useEffect(() => {
    onLoaded();
  }, [url, onLoaded]);

  useEffect(() => {
    // Push relevant meshes into global array
    if (nodes.Wolf3D_Head) headMesh.push(nodes.Wolf3D_Head);
    if (nodes.Wolf3D_Teeth) headMesh.push(nodes.Wolf3D_Teeth);
    if (nodes.Wolf3D_Beard) headMesh.push(nodes.Wolf3D_Beard);
    if (nodes.Wolf3D_Avatar) headMesh.push(nodes.Wolf3D_Avatar);
    if (nodes.Wolf3D_Head_Custom) headMesh.push(nodes.Wolf3D_Head_Custom);
  }, [nodes]);

  // Apply blendshapes and rotation on each frame
  useFrame(() => {
    if (blendshapes.length > 0) {
      blendshapes.forEach(element => {
        headMesh.forEach(mesh => {
          const index = mesh.morphTargetDictionary[element.categoryName];
          if (index >= 0) mesh.morphTargetInfluences[index] = element.score;
        });
      });

      // Apply head rotation
      nodes.Head.rotation.set(rotation.x, rotation.y, rotation.z);
      nodes.Neck.rotation.set(rotation.x / 5 + 0.3, rotation.y / 5, rotation.z / 5);
      nodes.Spine2.rotation.set(rotation.x / 10, rotation.y / 10, rotation.z / 10);
    }
  });

  return <primitive object={scene} position={[0, -1.75, 3]} />;
}

// Component to pick background color
function BackgroundColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const colors = ['#ffffff', '#f8f8f8', '#e0e0e0', '#ffcccc', '#ccffcc', '#ccccff', '#ffffcc', '#ffccff', '#ccffff'];
  return (
    <div className="color-picker">
      <p>Pick Background Color:</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        {colors.map(c => (
          <div
            key={c}
            onClick={() => onChange(c)}
            style={{
              width: 30,
              height: 30,
              backgroundColor: c,
              border: c === color ? '3px solid black' : '1px solid gray',
              cursor: 'pointer'
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Component to select GLB model
function ModelSelector({ models, selected, onSelect }: { models: {url: string, img: string}[], selected: string, onSelect: (url: string) => void }) {
  return (
    <div className="model-selector" style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
      {models.map(model => (
        <div
          key={model.url}
          onClick={() => onSelect(model.url)}
          style={{
            border: model.url === selected ? '3px solid blue' : '1px solid gray',
            padding: '4px',
            cursor: 'pointer'
          }}
        >
          <img src={model.img} alt="model" style={{ width: 60, height: 60 }} />
        </div>
      ))}
    </div>
  );
}

function App() {
  // State for currently loaded model
  const [url, setUrl] = useState<string>(
    "https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024"
  );

  // Loader visibility state
  const [loading, setLoading] = useState(true);

  // Background color state
  const [bgColor, setBgColor] = useState('#ffffff');

  // Model selection array
  const models = [
    { url: "https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024", img: 'https://dummyimage.com/60x60/000/fff.svg&text=1' },
    { url: "https://models.readyplayer.me/anothermodel.glb", img: 'https://dummyimage.com/60x60/000/fff.svg&text=2' },
    { url: "https://models.readyplayer.me/yetanother.glb", img: 'https://dummyimage.com/60x60/000/fff.svg&text=3' },
  ];

  // Dropzone for uploading custom GLB files
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

  // Video prediction loop
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

  // Handle video ready
  const handleStreamReady = (vid: HTMLVideoElement) => {
    video = vid;
    video.addEventListener("loadeddata", predict);
  };

  useEffect(() => { setup(); }, []);

  return (
    <div className="App" style={{ backgroundColor: bgColor }}>
      <CameraPermissions onStreamReady={handleStreamReady} />

      {/* Dropzone for GLB file upload */}
      <div {...getRootProps({ className: 'dropzone' })}>
        <p>Drag & drop RPM avatar GLB file here</p>
      </div>

      {/* URL input */}
      <input
        className="url"
        type="text"
        placeholder="Paste RPM avatar URL"
        onChange={(e) => setUrl(`${e.target.value}?morphTargets=ARKit&textureAtlas=1024`)}
      />

      {/* Video feed */}
      <video className="camera-feed" id="video" autoPlay playsInline></video>

      {/* Loader */}
      {loading && <div className="loader">Loading model...</div>}

      {/* 3D Canvas */}
      <Canvas style={{ height: 600 }} camera={{ fov: 25 }} shadows>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color={new Color(1, 1, 0)} intensity={0.5} castShadow />
        <pointLight position={[-10, 0, 10]} color={new Color(1, 0, 0)} intensity={0.5} castShadow />
        <pointLight position={[0, 0, 10]} intensity={0.5} castShadow />
        <Avatar url={url} onLoaded={() => setLoading(false)} />
      </Canvas>

      {/* Model selection */}
      <ModelSelector models={models} selected={url} onSelect={(newUrl) => { setLoading(true); setUrl(newUrl); }} />

      {/* Background color picker */}
      <BackgroundColorPicker color={bgColor} onChange={setBgColor} />

      {/* Logo */}
      <img className="logo" src="./logo.png" alt="logo" />
    </div>
  );
}

export default App;
