import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useFrame, useGraph } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { blendshapes, rotation } from "./FaceTracking";
import * as THREE from "three";

export interface AvatarRef {
  headMesh: THREE.Mesh[];
  nodes: Record<string, THREE.Object3D>;
}

interface AvatarProps {
  url: string;
}

const Avatar = forwardRef<AvatarRef, AvatarProps>(({ url }, ref) => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const { nodes } = useGraph(scene);
  const headMesh = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    headMesh.current = [];
    ["Wolf3D_Head", "Wolf3D_Teeth", "Wolf3D_Beard", "Wolf3D_Avatar", "Wolf3D_Head_Custom"].forEach(name => {
      const node = nodes[name];
      if (node && (node as THREE.Mesh).isMesh) headMesh.current.push(node as THREE.Mesh);
    });
  }, [nodes, url]);

  useImperativeHandle(ref, () => ({
    headMesh: headMesh.current,
    nodes,
  }));

  useFrame(() => {
    if (!blendshapes.length) return;

    headMesh.current.forEach(mesh => {
      const dict = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;
      if (!dict || !influences) return;

      blendshapes.forEach(element => {
        const index = dict[element.categoryName];
        if (index !== undefined && index >= 0) {
          influences[index] = element.score;
        }
      });
    });

    if (nodes.Head) nodes.Head.rotation.set(rotation.x, rotation.y, rotation.z);
    if (nodes.Neck) nodes.Neck.rotation.set(rotation.x / 5 + 0.3, rotation.y / 5, rotation.z / 5);
    if (nodes.Spine2) nodes.Spine2.rotation.set(rotation.x / 10, rotation.y / 10, rotation.z / 10);
  });

  return <primitive object={scene} position={[0, -1.75, 3]} ref={group} />;
});

export default Avatar;
