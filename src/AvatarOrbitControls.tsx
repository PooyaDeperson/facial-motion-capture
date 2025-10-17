// AvatarOrbitControls.tsx
import React, { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Camera, Vector3 } from "three";

interface AvatarOrbitControlsProps {
  target?: [number, number, number];
  enableZoom?: boolean;
}

const AvatarOrbitControls: React.FC<AvatarOrbitControlsProps> = ({
  target = [0, 1.62, 0],
  enableZoom = true,
}) => {
  const controlsRef = useRef<any>(null);

  // Define min/max camera positions along Z
  const minZ = 0.5898841583773153;
  const maxZ = 1.2732469772283634;

  // Compute distance from target
  const targetVector = new Vector3(...target);
  const minDistance = new Vector3(0, 1.68, minZ).distanceTo(targetVector);
  const maxDistance = new Vector3(0, 5.68, maxZ).distanceTo(targetVector);

  return (
    <OrbitControls
      ref={controlsRef}
      target={target}
      enablePan={false}
      enableZoom={enableZoom}
      minPolarAngle={Math.PI / 2}
      maxPolarAngle={Math.PI / 2}
      minDistance={minDistance}
      maxDistance={maxDistance}
    />
  );
};

export default AvatarOrbitControls;
