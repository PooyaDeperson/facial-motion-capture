// src/exportAnimation.ts
import { NodeIO } from '@gltf-transform/core';
import { Euler, Quaternion } from 'three';

export async function exportAnimation(baseUrl: string, recording: any[]) {
  if (recording.length === 0) {
    alert('No frames recorded!');
    return;
  }

  const io = new NodeIO();
  const doc = await io.read(baseUrl);
  const rootNode = doc.getRoot().listNodes()[0];

  // Use the last frame for saving
  const frame = recording[recording.length - 1];

  const euler = new Euler(frame.rotation.x, frame.rotation.y, frame.rotation.z);
  const quat = new Quaternion().setFromEuler(euler);
  rootNode.setRotation([quat.x, quat.y, quat.z, quat.w]);

  const meshes = doc.getRoot().listMeshes();
  if (meshes.length > 0) {
    const mesh = meshes[0];
    // Cast the weights to number[]
    const weights = Object.values(frame.blendshapes) as number[];
    mesh.setWeights(weights);
  }

  await io.write('animated-avatar.glb', doc);
  alert('Saved animated GLB with final frame!');
}
