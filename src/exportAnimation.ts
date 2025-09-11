import { NodeIO } from '@gltf-transform/core';
import { recording } from './animationRecorder';

export async function exportAnimation(baseUrl: string) {
  if (recording.length === 0) {
    alert('No frames recorded!');
    return;
  }

  const io = new NodeIO();
  const doc = await io.read(baseUrl);

  // Find all nodes with meshes
  const meshNodes = doc.getRoot()
    .listNodes()
    .filter((n) => n.getMesh() !== null);

  // Loop through recorded frames
  recording.forEach((frame) => {
    meshNodes.forEach((node) => {
      const mesh = node.getMesh();
      if (!mesh) return;

      // Each mesh has:
      // - mesh.getMorphTargetNames() -> array of morph target names
      // - mesh.setWeights([...]) -> set array of weights

      const morphNames = mesh.getMorphTargetNames(); 
      if (morphNames.length > 0) {
        // Build weights array for this frame
        const weights = morphNames.map((name) => frame.blendshapes[name] ?? 0);
        mesh.setWeights(weights);
      }

      // Apply node rotation
      node.setRotation([frame.rotation.x, frame.rotation.y, frame.rotation.z]);
    });
  });

  await io.write('animated-avatar.glb', doc);
  alert('Saved animated GLB!');
}
