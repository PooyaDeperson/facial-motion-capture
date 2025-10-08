// AvatarCanvas.tsx
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Avatar from "./Avatar";
import Loader from "./Loader";
import AvatarOrbitControls from "./AvatarOrbitControls";

interface AvatarCanvasProps {
  url: string | null;
  avatarKey: number;
  setAvatarReady: (ready: boolean) => void;
}

const AvatarCanvas: React.FC<AvatarCanvasProps> = ({ url, avatarKey, setAvatarReady }) => {
  const cameraPosition = [-0.0, 1.62, 1.09] as [number, number, number];
  const avatarCenter = [0, 1.68, 0] as [number, number, number]; // center for horizontal orbit

  return (
    <Canvas
      className="avatar-container mb:pos tb:avatar-pos bottom-0 pos-abs z-1"
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

      {/* Import orbit controls */}
      <AvatarOrbitControls target={avatarCenter} enableZoom={true} />

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
  );
};

export default AvatarCanvas;
