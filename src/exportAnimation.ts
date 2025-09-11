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
    const response = await fetch('/avatar.glb');
    const glbData = await response.arrayBuffer();
    const doc = await io.readBinary(new Uint8Array(glbData));
    const rootNode = doc.getRoot().listNodes()[0];
    const animation = doc.createAnimation('animation');
    const rotationSampler = doc.createAnimationSampler('rotationSampler');
    const rotationChannel = doc.createAnimationChannel('rotationChannel');
    rotationChannel.setTargetNode(rootNode);
    rotationChannel.setTargetPath('rotation');
    rotationChannel.setSampler(rotationSampler);

    // Create input and output for rotation
    const input = new Float32Array(recording.map(frame => frame.time / 1000));
    const output = new Float32Array(
      recording.flatMap(frame => {
        const euler = new Euler(frame.rotation.x, frame.rotation.y, frame.rotation.z);
        const quat = new Quaternion().setFromEuler(euler);
        return [quat.x, quat.y, quat.z, quat.w];
      })
    );

    // Create buffer for input and output
    const inputBuffer = doc.createBuffer().setURI('input-buffer');
    const outputBuffer = doc.createBuffer().setURI('output-buffer');

    // Create accessors for input and output
    const inputAccessor = doc.createAccessor()
      .setBuffer(inputBuffer)
      .setType('SCALAR')
      .setComponentType(5126) // FLOAT
      .setArray(input)
      .setCount(input.length);

    const outputAccessor = doc.createAccessor()
      .setBuffer(outputBuffer)
      .setType('VEC4')
      .setComponentType(5126) // FLOAT
      .setArray(output)
      .setCount(output.length / 4);

    rotationSampler.setInput(inputAccessor);
    rotationSampler.setOutput(outputAccessor);

    // Add blendshape samplers and channels
    const blendshapeKeys = Object.keys(recording[0].blendshapes);
    blendshapeKeys.forEach((key) => {
      const times = new Float32Array(recording.map(frame => frame.time / 1000));
      const values = new Float32Array(recording.map(frame => frame.blendshapes[key]));

      const inputBuffer = doc.createBuffer().setURI(`${key}-input-buffer`);
      const outputBuffer = doc.createBuffer().setURI(`${key}-output-buffer`);

      const inputAccessor = doc.createAccessor()
        .setBuffer(inputBuffer)
        .setType('SCALAR')
        .setComponentType(5126) // FLOAT
        .setArray(times)
        .setCount(times.length);

      const outputAccessor = doc.createAccessor()
        .setBuffer(outputBuffer)
        .setType('SCALAR')
        .setComponentType(5126) // FLOAT
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
