import "./App.css";
import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import CameraPermissions from "./camera-permission";
import ColorSwitcher from "./components/ColorSwitcher";
import AvatarSwitcher from "./components/AvatarSwitcher";
import FaceTracking from "./FaceTracking";
import Avatar from "./Avatar";
import Loader from "./Loader";

function App() {
  const [url, setUrl] = useState<string | null>(null);
  const [avatarKey, setAvatarKey] = useState(0);
  const [avatarReady, setAvatarReady] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [mediapipeReady, setMediapipeReady] = useState(false);

  const handleStreamReady = (stream: MediaStream) => {
    setVideoStream(stream);
  };

  // ✅ Fixed handler: works even when re-selecting same avatar
  const handleAvatarChange = (newUrl: string) => {
    // Always clear cache before loading
    useGLTF.clear(newUrl);

    if (url === newUrl) {
      // If same avatar, unmount first
      setUrl(null);

      // Re-mount on next tick
      setTimeout(() => {
        setUrl(newUrl);
        setAvatarKey((k) => k + 1);
      }, 0);
    } else {
      setUrl(newUrl);
      setAvatarKey((k) => k + 1);
    }

    setAvatarReady(false);
    setMediapipeReady(false);
  };

  return (
    <div className="App">
      {/* Camera permissions & stream setup */}
      <CameraPermissions onStreamReady={handleStreamReady} />

      {/* Loader while waiting for mediapipe */}
      {avatarReady && videoStream && !mediapipeReady && (
        <div className="reveal fade mediapipe-loader pos-fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50">
          <p className="text-white text-2xl animate-pulse">Keep smiling...</p>
        </div>
      )}

      {/* Face tracking only starts when avatar and camera are ready */}
      {avatarReady && videoStream && (
        <FaceTracking
          videoStream={videoStream}
          onMediapipeReady={() => setMediapipeReady(true)}
        />
      )}

      {/* 3D Avatar canvas */}
      <Canvas
        className="avatar-container mb:pos tb:avatar-pos bottom-0 pos-abs z-1"
        camera={{ fov: 27, position: [0, 0, 4.2] }}
        dpr={[1, window.devicePixelRatio]}
        shadows
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} castShadow />
        <pointLight position={[-10, 0, 10]} intensity={0.5} castShadow />
        <pointLight position={[0, 0, 10]} intensity={0.5} castShadow />

        {url && (
          <Suspense fallback={<Loader />}>
            <Avatar
              key={`${url}-${avatarKey}`}
              url={url}
              onLoaded={() => setAvatarReady(true)}
            />
          </Suspense>
        )}
      </Canvas>

      {/* UI components */}
      <ColorSwitcher />
      <AvatarSwitcher activeUrl={url} onAvatarChange={handleAvatarChange} />
    </div>
  );
}

export default App;
