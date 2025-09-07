import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useFrame, useGraph } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { blendshapes, rotation } from "./FaceTracking";
import * as THREE from "three";

const Avatar = forwardRef(({ url }: { url: string }, ref) => {
  const group = useRef<THREE.Group>();
  const { scene } = useGLTF(url);
  const { nodes } = useGraph(scene);

  const headMesh: THREE.Mesh[] = [];

  useEffect(() => {
    ["Wolf3D_Head", "Wolf3D_Teeth", "Wolf3D_Beard", "Wolf3D_Avatar", "Wolf3D_Head_Custom"].forEach(name => {
      if (nodes[name] && (nodes[name] as THREE.Mesh).isMesh) headMesh.push(nodes[name] as THREE.Mesh);
    });
  }, [nodes, url]);

  // Expose for export
  useImperativeHandle(ref, () => ({
    headMesh,
    nodes,
  }));

  useFrame(() => {
    if (blendshapes.length > 0) {
      blendshapes.forEach(element => {
        headMesh.forEach(mesh => {
          if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return; // ✅ safety check
          const index = mesh.morphTargetDictionary[element.categoryName];
          if (index !== undefined && index >= 0) {
            mesh.morphTargetInfluences[index] = element.score;
          }
        });
      });

      if (nodes.Head) nodes.Head.rotation.set(rotation.x, rotation.y, rotation.z);
      if (nodes.Neck) nodes.Neck.rotation.set(rotation.x / 5 + 0.3, rotation.y / 5, rotation.z / 5);
      if (nodes.Spine2) nodes.Spine2.rotation.set(rotation.x / 10, rotation.y / 10, rotation.z / 10);
    }
  });

  return <primitive object={scene} position={[0, -1.75, 3]} ref={group} />;
});

export default Avatar;
