import { NodeIO } from '@gltf-transform/core';
import { recording } from './animationRecorder';

export async function exportAnimation(baseUrl: string) {
  if (recording.length === 0) {
    alert('No frames recorded!');
    return;
  }

  const io = new NodeIO();
  const doc = await io.read(baseUrl);

  // Find all mesh nodes (blendshapes live here)
  const meshes = doc.getRoot()
    .listNodes()
    .filter(node => node.getMesh() !== null);

  recording.forEach(frame => {
    meshes.forEach(meshNode => {
      const mesh = meshNode.getMesh();
      if (!mesh) return;

      // Apply blendshape weights
      const morphTargets = mesh.listMorphTargets();
      morphTargets.forEach(morph => {
        const name = morph.getName();
        const value = frame.blendshapes[name] ?? 0;
        morph.setWeights([value]);
      });

      // Apply rotation to the node itself
      meshNode.setRotation([frame.rotation.x, frame.rotation.y, frame.rotation.z]);
    });
  });

  await io.write('animated-avatar.glb', doc);
  alert('Saved animated GLB!');
}
