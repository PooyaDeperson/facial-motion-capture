import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export function exportBlendshapeRecording(frames: any[], fileName = "faceRecording.glb") {
  if (!frames.length) {
    alert("No frames to export!");
    return;
  }

  // Extract time values in seconds
  const startTime = frames[0].timestamp;
  const times = frames.map(f => (f.timestamp - startTime) / 1000);

  // Get unique blendshape names
  const blendshapeNames: string[] = frames[0].blendshapes.map((b: any) => b.categoryName);

  // Build tracks for each blendshape
  const tracks: THREE.KeyframeTrack[] = [];
  for (let i = 0; i < blendshapeNames.length; i++) {
    const values = frames.map(f => f.blendshapes[i].score);

    const track = new THREE.NumberKeyframeTrack(
      `.morphTargetInfluences[${i}]`,
      times,
      values
    );
    tracks.push(track);
  }

  // Create animation clip
  const clip = new THREE.AnimationClip("FaceRecording", -1, tracks);

  // Create dummy geometry with morph targets
  const baseGeo = new THREE.BoxGeometry(1, 1, 1);
  baseGeo.morphAttributes.position = [];

  blendshapeNames.forEach((_: string, i: number) => {
    const morphGeo = baseGeo.clone();
    morphGeo.translate(0, 0.01 * (i + 1), 0); // slight offset for uniqueness
    baseGeo.morphAttributes.position.push(morphGeo.attributes.position);
  });

  // Create material
  const material = new THREE.MeshStandardMaterial({ color: 0xdddddd });

  // Create mesh
  const mesh = new THREE.Mesh(baseGeo, material);
  mesh.animations = [clip];

  // Export GLB
  const exporter = new GLTFExporter();

  // ✅ Correct parse call for TypeScript
  exporter.parse(
    mesh,
    (result) => {
      let blob: Blob;
      if (result instanceof ArrayBuffer) {
        blob = new Blob([result], { type: "model/gltf-binary" });
      } else {
        blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    },
    { binary: true } as any // ✅ cast to any to satisfy TS
  );
}
