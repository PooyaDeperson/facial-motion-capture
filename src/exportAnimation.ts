// src/exportAnimation.ts
import { NodeIO } from '@gltf-transform/core';
import { HTTPS } from '@gltf-transform/functions';
import { Euler, Quaternion } from 'three';

export async function exportAnimation(baseUrl: string, recording: any[]) {
  if (recording.length === 0) {
    alert('No frames recorded!');
    return;
  }

  const io = new NodeIO()
    .registerExtensions()
    .registerDependencies({
      'uri:https': HTTPS,
    });

  try {
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
      const weights = Object.values(frame.blendshapes) as number[];
      mesh.setWeights(weights);
    }

    // Save the GLB locally
    const glb = await io.writeBinary(doc);
    const blob = new Blob([glb], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animated-avatar.glb';
    a.click();
    URL.revokeObjectURL(url);
    alert('Saved animated GLB with final frame!');
  } catch (error) {
    console.error('Error exporting animation:', error);
    alert('Failed to export animation. See console for details.');
  }
}
