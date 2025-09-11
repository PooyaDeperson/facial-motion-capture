// src/exportAnimation.ts
import { NodeIO, AnimationSampler, AnimationChannel, Animation } from '@gltf-transform/core';
import { Euler, Quaternion } from 'three';

interface FrameData {
  time: number;
  blendshapes: Record<string, number>;
  rotation: { x: number; y: number; z: number };
}

export async function exportAnimation(recording: FrameData[]) {
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
    const input = new Float32Array(recording.map(frame => frame.time / 1000));
    const output = new Float32Array(
      recording.flatMap(frame => {
        const euler = new Euler(frame.rotation.x, frame.rotation.y, frame.rotation.z);
        const quat = new Quaternion().setFromEuler(euler);
        return [quat.x, quat.y, quat.z, quat.w];
      })
    );

    // Create accessors for input and output
    const inputAccessor = doc.createAccessor()
      .setBuffer(doc.createBuffer(new Uint8Array(input.buffer)).setURI('input-buffer'))
      .setType('SCALAR')
      .setComponentType('FLOAT')
      .setArray(input)
      .setCount(input.length);

    const outputAccessor = doc.createAccessor()
      .setBuffer(doc.createBuffer(new Uint8Array(output.buffer)).setURI('output-buffer'))
      .setType('VEC4')
      .setComponentType('FLOAT')
      .setArray(output)
      .setCount(output.length / 4);

    rotationSampler.setInput(inputAccessor);
    rotationSampler.setOutput(outputAccessor);

    // Add blendshape samplers and channels
    const blendshapeKeys = Object.keys(recording[0].blendshapes);
    blendshapeKeys.forEach((key) => {
      const times = new Float32Array(recording.map(frame => frame.time / 1000));
      const values = new Float32Array(recording.map(frame => frame.blendshapes[key]));

      const inputAccessor = doc.createAccessor()
        .setBuffer(doc.createBuffer(new Uint8Array(times.buffer)).setURI(`${key}-input-buffer`))
        .setType('SCALAR')
        .setComponentType('FLOAT')
        .setArray(times)
        .setCount(times.length);

      const outputAccessor = doc.createAccessor()
        .setBuffer(doc.createBuffer(new Uint8Array(values.buffer)).setURI(`${key}-output-buffer`))
        .setType('SCALAR')
        .setComponentType('FLOAT')
        .setArray(values)
        .setCount(values.length);

      const sampler = doc.createAnimationSampler(`${key}Sampler`);
      const channel = doc.createAnimationChannel(`${key}Channel`);

      sampler.setInput(inputAccessor);
      sampler.setOutput(outputAccessor);

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