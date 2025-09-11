// src/exportAnimation.ts
import { NodeIO } from '@gltf-transform/core';
import { recording } from './animationRecorder';
import { Euler, Quaternion } from 'three';

/**
 * Export the recorded avatar animation to a GLB file
 * @param baseUrl URL of the original GLB avatar
 */
export async function exportAnimation(baseUrl: string) {
  if (recording.length === 0) {
    alert('No frames recorded!');
    return;
  }

  const io = new NodeIO();
  const doc = await io.read(baseUrl);

  // Grab the root node of the avatar
  const rootNode = doc.getRoot().listNodes()[0];

  // Use the last frame for saving
  const frame = recording[recording.length - 1];

  // --- 1️⃣ Convert Euler rotation to quaternion using Three.js ---
  const euler = new Euler(frame.rotation.x, frame.rotation.y, frame.rotation.z);
  const quat = new Quaternion().setFromEuler(euler);

  // rootNode.setRotation expects a vec4 tuple
  rootNode.setRotation([quat.x, quat.y, quat.z, quat.w]);

  // --- 2️⃣ Apply blendshape weights ---
  const meshes = doc.getRoot().listMeshes();
  if (meshes.length > 0) {
    const mesh = meshes[0];
    // Blendshape weights must match the GLB morph target order
    const weights = Object.values(frame.blendshapes);
    mesh.setWeights(weights);
  }

  // --- 3️⃣ Save the GLB locally ---
  await io.write('animated-avatar.glb', doc);
  alert('Saved animated GLB with final frame!');
}
