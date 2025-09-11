// src/animationRecorder.ts
export interface FrameData {
  time: number;
  blendshapes: { [key: string]: number };
  rotation: { x: number; y: number; z: number };
}

let recording: FrameData[] = [];

export function startRecording() {
  recording = [];
  console.log("Animation recording started.");
}

export function stopRecording() {
  console.log(`Animation recording stopped. Total frames: ${recording.length}`);
}

export function captureFrame(blendshapes: any[], rotation: { x: number; y: number; z: number }) {
  const frame: FrameData = {
    time: performance.now(),
    blendshapes: blendshapes.reduce((acc, b) => {
      acc[b.categoryName] = b.score;
      return acc;
    }, {} as { [key: string]: number }),
    rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
  };
  recording.push(frame);
}

export function getRecording(): FrameData[] {
  return [...recording];
}

export function clearRecording() {
  recording = [];
  console.log("Recording cleared.");
}
