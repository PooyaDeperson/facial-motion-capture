// AvatarCanvas.tsx
import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import Avatar from "./Avatar";
import AvatarOrbitControls from "./AvatarOrbitControls";
import AvatarLoader from "./AvatarLoader"; // <-- your 2D dynamic loader

interface AvatarCanvasProps {
  url: string | null;
  avatarKey: number;
  setAvatarReady: (ready: boolean) => void;
}

const AvatarCanvas: React.FC<AvatarCanvasProps> = ({ url, avatarKey, setAvatarReady }) => {
  const [loading, setLoading] = useState(true);

  const cameraPosition = [-0.0, 1.62, 1.09] as [number, number, number];
  const avatarCenter = [0, 1.68, 0] as [number, number, number];

  useEffect(() => {
    if (url) {
      setLoading(true);
      setAvatarReady(false);
    }
  }, [url, setAvatarReady]);

  return (
    <>
      {/* 2D Loader Overlay */}
<AvatarLoader
  visible={loading}
  initialMessage="Just a little patience..."
  secondMessage="Someone’s on the way!"
  thirdMessage="I promise, someone is coming..."
  secondDelay={10000}
  thirdDelay={20000}
/>


      <Canvas
        className="avatar-container mb:pos tb:avatar-pos bottom-0 pos-abs-important z-1"
        camera={{
          fov: 27,
          position: cameraPosition,
          rotation: [0.05, -0.0, 0.0],
        }}
        dpr={[1, window.devicePixelRatio]}
        shadows
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} castShadow />
        <pointLight position={[-10, 0, 10]} intensity={0.5} castShadow />
        <pointLight position={[0, 0, 10]} intensity={0.5} castShadow />

        <AvatarOrbitControls target={avatarCenter} enableZoom={true} />

        {url && (
          <Suspense fallback={null}>
            <Avatar
              key={`${url}-${avatarKey}`}
              url={url}
              onLoaded={() => {
                setAvatarReady(true);
                setLoading(false);
              }}
            />
          </Suspense>
        )}
      </Canvas>
    </>
  );
};

export default AvatarCanvas;
