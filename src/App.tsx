import './App.css';

import { useEffect, useState } from 'react';
import { FaceLandmarker, FaceLandmarkerOptions, FilesetResolver } from "@mediapipe/tasks-vision";
import { Color, Euler, Matrix4 } from 'three';
import { Canvas, useFrame, useGraph } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useDropzone } from 'react-dropzone';

// Global variables for face tracking
let video: HTMLVideoElement;
let faceLandmarker: FaceLandmarker;
let lastVideoTime = -1;
let blendshapes: any[] = [];
let rotation: Euler;
let headMesh: any[] = [];

// Options for Mediapipe FaceLandmarker
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

// Avatar component renders the GLTF model and applies blendshapes & head rotation
function Avatar({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const { nodes } = useGraph(scene);

  // Collect relevant meshes once model is loaded
  useEffect(() => {
    if (nodes.Wolf3D_Head) headMesh.push(nodes.Wolf3D_Head);
    if (nodes.Wolf3D_Teeth) headMesh.push(nodes.Wolf3D_Teeth);
    if (nodes.Wolf3D_Beard) headMesh.push(nodes.Wolf3D_Beard);
    if (nodes.Wolf3D_Avatar) headMesh.push(nodes.Wolf3D_Avatar);
    if (nodes.Wolf3D_Head_Custom) headMesh.push(nodes.Wolf3D_Head_Custom);
  }, [nodes, url]);

  // Update avatar morph targets and rotations each frame
  useFrame(() => {
    if (blendshapes.length > 0) {
      blendshapes.forEach(element => {
        headMesh.forEach(mesh => {
          let index = mesh.morphTargetDictionary[element.categoryName];
          if (index >= 0) {
            mesh.morphTargetInfluences[index] = element.score;
          }
        });
      });

      // Apply head & spine rotations from facial transformation matrix
      nodes.Head.rotation.set(rotation.x, rotation.y, rotation.z);
      nodes.Neck.rotation.set(rotation.x / 5 + 0.3, rotation.y / 5, rotation.z / 5);
      nodes.Spine2.rotation.set(rotation.x / 10, rotation.y / 10, rotation.z / 10);
    }
  });

  return <primitive object={scene} position={[0, -1.75, 3]} />
}

// A reusable popup component (used for requesting camera permissions)
function PermissionPopup({ title, subtitle, buttonText, onClick, showButton }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-xl">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        {showButton && (
          <button
            onClick={onClick}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

function App() {
  const [url, setUrl] = useState<string>("https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024");
  // Track camera permission state (prompt → before requesting, denied → user blocked, granted → allowed)
  const [permissionState, setPermissionState] = useState<"prompt" | "denied" | "granted">("prompt");

  // Dropzone handler for loading custom GLB avatars
  const { getRootProps } = useDropzone({
    onDrop: files => {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setUrl(reader.result as string);
      }
      reader.readAsDataURL(file);
    }
  });

  // Request camera permissions when user clicks the CTA
  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });
      // Permission granted → update state & attach stream to <video>
      setPermissionState("granted");
      video = document.getElementById("video") as HTMLVideoElement;
      video.srcObject = stream;
      video.addEventListener("loadeddata", predict);
    } catch (err) {
      // If user blocks access in the browser prompt
      setPermissionState("denied");
    }
  };

  // Setup Mediapipe FaceLandmarker once (doesn't request camera yet)
  const setup = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, options);
  };

  // Run face prediction loop on each frame
  const predict = async () => {
    let nowInMs = Date.now();
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      const faceLandmarkerResult = faceLandmarker.detectForVideo(video, nowInMs);

      if (faceLandmarkerResult.faceBlendshapes && faceLandmarkerResult.faceBlendshapes.length > 0 && faceLandmarkerResult.faceBlendshapes[0].categories) {
        blendshapes = faceLandmarkerResult.faceBlendshapes[0].categories;

        const matrix = new Matrix4().fromArray(faceLandmarkerResult.facialTransformationMatrixes![0].data);
        rotation = new Euler().setFromRotationMatrix(matrix);
      }
    }

    window.requestAnimationFrame(predict);
  };

  // Handle avatar URL changes manually via input
  const handleOnChange = (event: any) => {
    setUrl(`${event.target.value}?morphTargets=ARKit&textureAtlas=1024`);
  };

useEffect(() => {
  setup();

  if (navigator.permissions) {
    navigator.permissions.query({ name: "camera" as PermissionName }).then((result) => {
      setPermissionState(result.state as any);

      // If camera is already allowed, open it immediately
      if (result.state === "granted") {
        requestCamera();
      }

      // Watch for changes (e.g. user updates permissions via browser settings)
      result.onchange = () => {
        setPermissionState(result.state as any);

        if (result.state === "granted") {
          requestCamera();
        }
      };
    });
  }
}, []);


  return (
    <div className="App">
      {/* Show popup before requesting permissions */}
      {permissionState === "prompt" && (
        <PermissionPopup
          title="Camera Permission Required"
          subtitle="We need access to your camera to animate your avatar in real time."
          buttonText="Allow Camera"
          onClick={requestCamera}
          showButton
        />
      )}

      {/* Show popup if user denies camera in the native browser prompt */}
      {permissionState === "denied" && (
        <PermissionPopup
          title="Camera Access Denied"
          subtitle="Please enable camera access in your browser settings to continue."
          showButton={false}
        />
      )}

      {/* Main app content */}
      <div {...getRootProps({ className: 'dropzone' })}>
        <p>Drag & drop RPM avatar GLB file here</p>
      </div>
      <input className='url' type="text" placeholder="Paste RPM avatar URL" onChange={handleOnChange} />
      {/* Video element where camera stream will be attached */}
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
