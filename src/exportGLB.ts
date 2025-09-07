import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export function exportBlendshapeRecording(frames: any[], fileName = "faceRecording.glb") {
  if (!frames.length) {
    alert("No frames to export!");
    return;
  }

  // Extract time values
  const startTime = frames[0].timestamp;
  const times = frames.map(f => (f.timestamp - startTime) / 1000); // sec

  // Get unique blendshape names
  const blendshapeNames = frames[0].blendshapes.map((b: any) => b.categoryName);

  // Build tracks for each blendshape
  const tracks: THREE.KeyframeTrack[] = [];
  for (let i = 0; i < blendshapeNames.length; i++) {
    const name = blendshapeNames[i];
    const values = frames.map(f => f.blendshapes[i].score);

    // Track name format: "meshName.morphTargetInfluences[index]"
    const track = new THREE.NumberKeyframeTrack(
      `.morphTargetInfluences[${i}]`,
      times,
      values
    );
    tracks.push(track);
  }

  // Create animation clip
  const clip = new THREE.AnimationClip("FaceRecording", -1, tracks);

  // Create a dummy geometry with blendshape targets
  const baseGeo = new THREE.BoxGeometry(1, 1, 1);
  blendshapeNames.forEach((name, i) => {
    const morphGeo = baseGeo.clone();
    morphGeo.translate(0, 0.01 * (i + 1), 0); // small offset for uniqueness
    baseGeo.morphAttributes.position = baseGeo.morphAttributes.position || [];
    baseGeo.morphAttributes.position.push(morphGeo.attributes.position);
  });

  const material = new THREE.MeshStandardMaterial({ color: 0xdddddd, morphTargets: true });
  const mesh = new THREE.Mesh(baseGeo, material);

  // Attach animation
  mesh.animations = [clip];

  // Export to GLB
  const exporter = new GLTFExporter();
  exporter.parse(
    mesh,
    (result) => {
      const blob = new Blob([result as ArrayBuffer], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    },
    { binary: true }
  );
}
