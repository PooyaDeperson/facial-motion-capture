// src/exportAnimation.ts
import { NodeIO, AnimationSampler, AnimationChannel, Animation } from '@gltf-transform/core';
import { Euler, Quaternion } from 'three';

export async function exportAnimation(recording: any[]) {
  if (recording.length === 0) {
    alert('No frames recorded!');
    return;
  }

  const io = new NodeIO();

  try {
    // Fetch the GLB file as a binary
    const response = await fetch('/avatar.glb');
    const glbData = await response.arrayBuffer();

    // Read the GLB data
    const doc = await io.readBinary(new Uint8Array(glbData));
    const rootNode = doc.getRoot().listNodes()[0];

    // Create an animation
    const animation = doc.createAnimation('animation');

    // Create samplers for rotation and blendshapes
    const rotationSampler = doc.createAnimationSampler('rotationSampler');
    const blendshapeSamplers: Record<string, AnimationSampler> = {};

    // Create channels for rotation and blendshapes
    const rotationChannel = doc.createAnimationChannel('rotationChannel');
    rotationChannel.setTargetNode(rootNode);
    rotationChannel.setTargetPath('rotation');
    rotationChannel.setSampler(rotationSampler);

    // Add rotation keyframes
    const input: number[] = [];
    const output: number[] = [];
    const blendshapeInputs: Record<string, number[]> = {};
    const blendshapeOutputs: Record<string, number[]> = {};

    recording.forEach((frame, i) => {
      const time = frame.time / 1000; // Convert to seconds
      input.push(time);

      const euler = new Euler(frame.rotation.x, frame.rotation.y, frame.rotation.z);
      const quat = new Quaternion().setFromEuler(euler);
      output.push(quat.x, quat.y, quat.z, quat.w);

      // Initialize blendshape arrays
      Object.keys(frame.blendshapes).forEach((key) => {
        if (!blendshapeInputs[key]) blendshapeInputs[key] = [];
        if (!blendshapeOutputs[key]) blendshapeOutputs[key] = [];
      });

      // Add blendshape keyframes
      Object.entries(frame.blendshapes).forEach(([key, value]) => {
        blendshapeInputs[key].push(time);
        blendshapeOutputs[key].push(value);
      });
    });

    rotationSampler.setInput(input);
    rotationSampler.setOutput(output);

    // Add blendshape samplers and channels
    Object.entries(blendshapeInputs).forEach(([key, times]) => {
      const sampler = doc.createAnimationSampler(`${key}Sampler`);
      const channel = doc.createAnimationChannel(`${key}Channel`);

      sampler.setInput(times);
      sampler.setOutput(blendshapeOutputs[key]);

      channel.setTargetNode(rootNode);
      channel.setTargetPath(`weights.${key}`);
      channel.setSampler(sampler);

      animation.addChannel(channel);
    });

    animation.addChannel(rotationChannel);
    animation.addSampler(rotationSampler);

    // Save the GLB locally
    const glb = await io.writeBinary(doc);
    const blob = new Blob([glb], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animated-avatar.glb';
    a.click();
    URL.revokeObjectURL(url);
    alert('Saved animated GLB with animation!');
  } catch (error) {
    console.error('Error exporting animation:', error);
    alert('Failed to export animation. See console for details.');
  }
}
