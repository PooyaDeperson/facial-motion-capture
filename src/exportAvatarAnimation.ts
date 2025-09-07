import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export function exportAvatarAnimation(headMesh: THREE.Mesh[], nodes: Record<string, THREE.Object3D>, frames: any[], fileName = "avatarRecording.glb") {
  if (!frames.length || !headMesh.length) return alert("No frames or mesh to export");

  const times = frames.map(f => (f.timestamp - frames[0].timestamp) / 1000);
  const tracks: THREE.KeyframeTrack[] = [];

  headMesh.forEach(mesh => {
    const dict = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;
    if (!dict || !influences) return;

    Object.keys(dict).forEach(name => {
      const index = dict[name];
      const values = frames.map(f => {
        const target = f.blendshapes.find((b: any) => b.categoryName === name);
        return target ? target.score : 0;
      });
      tracks.push(new THREE.NumberKeyframeTrack(`${mesh.name}.morphTargetInfluences[${index}]`, times, values));
    });
  });

  // Head rotation
  if (nodes.Head) {
    const headQuatValues = frames.flatMap(f => {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(f.headRotation.x, f.headRotation.y, f.headRotation.z));
      return [q.x, q.y, q.z, q.w];
    });
    tracks.push(new THREE.QuaternionKeyframeTrack(`${nodes.Head.name}.quaternion`, times, headQuatValues));
  }

  // Neck rotation
  if (nodes.Neck) {
    const neckQuatValues = frames.flatMap(f => {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(f.headRotation.x / 5 + 0.3, f.headRotation.y / 5, f.headRotation.z / 5));
      return [q.x, q.y, q.z, q.w];
    });
    tracks.push(new THREE.QuaternionKeyframeTrack(`${nodes.Neck.name}.quaternion`, times, neckQuatValues));
  }

  const clip = new THREE.AnimationClip("FaceAnimation", -1, tracks);

  const scene = new THREE.Group();
  headMesh.forEach(mesh => scene.add(mesh));
  if (nodes.Head) scene.add(nodes.Head);
  if (nodes.Neck) scene.add(nodes.Neck);

  scene.animations = [clip];

  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    result => {
      const blob = result instanceof ArrayBuffer
        ? new Blob([result], { type: "model/gltf-binary" })
        : new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    },
    { binary: true } as any
  );
}
