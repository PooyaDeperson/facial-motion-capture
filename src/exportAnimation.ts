import { NodeIO } from '@gltf-transform/core';
import { recording } from './animationRecorder';

/**
 * Export animation by applying final frame only.
 * This avoids dealing with morph target accessors directly.
 */
export async function exportAnimation(baseUrl: string) {
  if (recording.length === 0) {
    alert('No frames recorded!');
    return;
  }

  const io = new NodeIO();
  const doc = await io.read(baseUrl);

  // Grab the root node
  const rootNode = doc.getRoot().listNodes()[0];

  // Get the last recorded frame
  const frame = recording[recording.length - 1];

  // Apply rotation
  rootNode.setRotation([frame.rotation.x, frame.rotation.y, frame.rotation.z]);

  // Apply blendshape weights to the first mesh primitive
  const meshes = doc.getRoot().listMeshes();
  if (meshes.length > 0) {
    const mesh = meshes[0];
    const weights = Object.values(frame.blendshapes);
    mesh.setWeights(weights); // works if order matches GLB morph targets
  }

  await io.write('animated-avatar.glb', doc);
  alert('Saved animated GLB!');
}
