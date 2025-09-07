// exportGLB.ts
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const ARKIT_BLENDSHAPES = [
  "_neutral","browDownLeft","browDownRight","browInnerUp","browOuterUpLeft","browOuterUpRight",
  "cheekPuff","cheekSquintLeft","cheekSquintRight","eyeBlinkLeft","eyeBlinkRight","eyeLookDownLeft",
  "eyeLookDownRight","eyeLookInLeft","eyeLookInRight","eyeLookOutLeft","eyeLookOutRight","eyeLookUpLeft",
  "eyeLookUpRight","eyeSquintLeft","eyeSquintRight","jawForward","jawLeft","jawRight","jawOpen","mouthClose",
  "mouthFunnel","mouthPucker","mouthLeft","mouthRight","mouthSmileLeft","mouthSmileRight","mouthFrownLeft",
  "mouthFrownRight","mouthDimpleLeft","mouthDimpleRight","mouthStretchLeft","mouthStretchRight","mouthRollLower",
  "mouthRollUpper","mouthShrugLower","mouthShrugUpper","mouthPressLeft","mouthPressRight","mouthLowerDownLeft",
  "mouthLowerDownRight","mouthUpperUpLeft","mouthUpperUpRight","noseSneerLeft","noseSneerRight","tongueOut"
];

export function exportBlendshapeRecording(frames: any[], fileName = "faceRecording.glb") {
  if (!frames.length) {
    alert("No frames to export!");
    return;
  }

  const startTime = frames[0].timestamp;
  const times = frames.map(f => (f.timestamp - startTime) / 1000);

  const tracks: THREE.KeyframeTrack[] = [];

  // Morph targets (blendshapes)
  const dummyGeo = new THREE.BoxGeometry(1,1,1);
  dummyGeo.morphAttributes.position = [];

  ARKIT_BLENDSHAPES.forEach((name, i) => {
    const values = frames.map(f => {
      const target = f.blendshapes.find((b:any) => b.categoryName === name);
      return target ? target.score : 0;
    });

    // Create track
    tracks.push(new THREE.NumberKeyframeTrack(
      `.morphTargetInfluences[${i}]`,
      times,
      values
    ));

    // Add dummy morph geometry
    const morphGeo = dummyGeo.clone();
    morphGeo.translate(0, 0.01*(i+1), 0); // slight offset
    dummyGeo.morphAttributes.position.push(morphGeo.attributes.position);
  });

  // Head rotation
  ["Head","Neck","Spine2"].forEach(nodeName => {
    const valuesX = frames.map(f => f.headRotation?.x ?? 0);
    const valuesY = frames.map(f => f.headRotation?.y ?? 0);
    const valuesZ = frames.map(f => f.headRotation?.z ?? 0);

    tracks.push(new THREE.VectorKeyframeTrack(`${nodeName}.rotation[x]`, times, valuesX));
    tracks.push(new THREE.VectorKeyframeTrack(`${nodeName}.rotation[y]`, times, valuesY));
    tracks.push(new THREE.VectorKeyframeTrack(`${nodeName}.rotation[z]`, times, valuesZ));
  });

  // Create animation clip
  const clip = new THREE.AnimationClip("FaceRecording", -1, tracks);

  // Create dummy mesh
  const material = new THREE.MeshStandardMaterial({ color: 0xdddddd });
  const mesh = new THREE.Mesh(dummyGeo, material);
  mesh.animations = [clip];

  // Export
  const exporter = new GLTFExporter();
  exporter.parse(
    mesh,
    result => {
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
    { binary: true } as any // TS cast
  );
}
