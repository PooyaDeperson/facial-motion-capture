// src/exportAnimation.ts
import { NodeIO } from '@gltf-transform/core';
import { recording } from './animationRecorder';

export async function exportAnimation(baseUrl: string) {
  const io = new NodeIO();
  const doc = await io.read(baseUrl); // load your existing GLB

  const node = doc.getRoot().listNodes()[0]; // avatar root node

  recording.forEach((frame) => {
    // Apply blendshapes
    Object.entries(frame.blendshapes).forEach(([name, value]) => {
      const morph = node.listMorphTargets().find(m => m.getName() === name);
      if (morph) morph.setWeights([value]);
    });

    // Apply rotations
    node.setRotation([frame.rotation.x, frame.rotation.y, frame.rotation.z]);
  });

  await io.write('animated-avatar.glb', doc);
  alert('Saved animated GLB!');
}
